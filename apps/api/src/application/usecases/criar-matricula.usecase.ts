import { ConflictError } from "../../domain/errors/conflict.error.js";
import { ForbiddenError } from "../../domain/errors/forbidden.error.js";
import { NotFoundError } from "../../domain/errors/not-found.error.js";
import { ValidationError } from "../../domain/errors/validation.error.js";
import type { AlunoRepository } from "../../domain/repositories/aluno.repository.js";
import type { AnoLetivoRepository } from "../../domain/repositories/ano-letivo.repository.js";
import type { MatriculaRepository } from "../../domain/repositories/matricula.repository.js";
import type { DocumentoRepository } from "../../domain/repositories/documento.repository.js";
import type { UnidadeEscolarRepository } from "../../domain/repositories/unidade-escola.repository.js";
import { StatusMatriculaEnum } from "../../domain/enums/status-matricula.enum.js";
import type { Sexo } from "../../domain/enums/sexo.enum.js";
import type { UnitOfWork } from "../interfaces/unit-of-work.interface.js";
import type { FileStorageService } from "../interfaces/file-storage.interface.js";
import type { UsuarioAutenticado } from "../types/authenticated-user.type.js";
import { cpfEhValido } from "@oreon/utils/cpf";
import { Aluno } from "../../domain/entities/aluno.entity.js";
import { Matricula } from "../../domain/entities/matricula.entity.js";
import { Result } from "../../domain/shared/result.js";

export type CriarMatriculaRequest = {
  readonly usuarioAutenticado: UsuarioAutenticado;
  readonly cpf: string;
  readonly nome: string;
  readonly sexo: Sexo;
  readonly dataDeNascimento: Date;
  readonly unidadeId: number;
  readonly periodoLetivoId: number;
  readonly comprovanteResidencia: {
    readonly fileName: string;
    readonly content: Buffer;
  };
  readonly historicoEscolar: {
    readonly fileName: string;
    readonly content: Buffer;
  };
};

export class CriarMatriculaUseCase {
  constructor(
    private readonly alunoRepository: AlunoRepository,
    private readonly unidadeEscolarRepository: UnidadeEscolarRepository,
    private readonly anoLetivoRepository: AnoLetivoRepository,
    private readonly matriculaRepository: MatriculaRepository,
    private readonly documentoRepository: DocumentoRepository,
    private readonly fileStorageService: FileStorageService,
    private readonly uow: UnitOfWork
  ) {}

  async executar(request: CriarMatriculaRequest): Promise<Result<number, ValidationError | NotFoundError | ForbiddenError | ConflictError>> {
    const unidade = await this.unidadeEscolarRepository.obterUnidadePorId(request.unidadeId);

    if (!unidade) {
      return Result.fail(new NotFoundError(`Unidade com ID ${request.unidadeId} não encontrada`));
    }

    if (unidade.escolaId !== request.usuarioAutenticado.escolaId) {
      return Result.fail(new ForbiddenError("Você não tem permissão para criar matrículas nesta unidade"));
    }

    const periodoLetivoExiste = await this.anoLetivoRepository.existe(request.periodoLetivoId);

    if (!periodoLetivoExiste) {
      return Result.fail(
        ValidationError.semantico([
          {
            propriedade: "periodoLetivoId",
            mensagem: `Período letivo com id ${request.periodoLetivoId} não existe`,
          },
        ])
      );
    }

    return this.uow.transact(async () => {
      let aluno = await this.alunoRepository.obterAlunoPorCpf(request.cpf);

      if (!aluno) {
        const alunoResult = Aluno.criar({
          id: await this.alunoRepository.obterProximoId(),
          nome: request.nome,
          cpf: request.cpf,
          dataDeNascimento: request.dataDeNascimento,
          sexo: request.sexo,
          // TODO
          escolaId: -1,
        });

        if (Result.isFailure(alunoResult)) {
          return alunoResult;
        }

        await this.alunoRepository.salvar(alunoResult.value);

        aluno = alunoResult.value;
      }

      // Check for existing matriculation
      const matriculaExistente = await this.matriculaRepository.obterMatriculaPorEstudanteEPeriodoLetivo(
        aluno.id,
        request.periodoLetivoId
      );

      if (matriculaExistente) {
        return Result.fail(new ConflictError("Já existe uma matrícula para este aluno neste período letivo"));
      }

      // Create comprovante de residência document with content (status: em-processamento)
      const comprovanteResidenciaDoc = await this.documentoRepository.criarDocumento({
        conteudo: request.comprovanteResidencia.content.toString("base64"),
      });

      // Create histórico escolar document with content (status: em-processamento)
      const historicoEscolarDoc = await this.documentoRepository.criarDocumento({
        conteudo: request.historicoEscolar.content.toString("base64"),
      });

      // Schedule async file uploads for both documents concurrently
      setImmediate(() => {
        this.processarUploadsDocumentos(
          {
            id: comprovanteResidenciaDoc.id,
            fileName: request.comprovanteResidencia.fileName,
            content: request.comprovanteResidencia.content,
          },
          {
            id: historicoEscolarDoc.id,
            fileName: request.historicoEscolar.fileName,
            content: request.historicoEscolar.content,
          }
        );
      });

      // Create the matriculation with "Ativa" status
      const matricula = Matricula.criar({
        id: await this.matriculaRepository.obterProximoId(),
        unidadeId: request.unidadeId,
        estudanteId: aluno.id,
        periodoLetivoId: request.periodoLetivoId,
        status: StatusMatriculaEnum.Ativa,
        dataCriacao: new Date(),
        comprovanteResidenciaId: comprovanteResidenciaDoc.id,
        historicoEscolarId: historicoEscolarDoc.id,
      });

      if (Result.isFailure(matricula)) {
        return matricula;
      }

      await this.matriculaRepository.salvar(matricula.value);

      return Result.ok(matricula.value.id);
    });
  }

  private calcularIdade(dataDeNascimento: Date): number {
    const hoje = new Date();
    let idade = hoje.getFullYear() - dataDeNascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = dataDeNascimento.getMonth();

    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < dataDeNascimento.getDate())) {
      idade--;
    }

    return idade;
  }

  private async processarUploadsDocumentos(
    comprovanteResidencia: { id: number; fileName: string; content: Buffer },
    historicoEscolar: { id: number; fileName: string; content: Buffer }
  ): Promise<void> {
    const uploadResults = await Promise.allSettled([
      // Upload comprovante de residência
      this.fileStorageService.uploadFile({
        fileName: comprovanteResidencia.fileName,
        content: comprovanteResidencia.content,
      }),
      // Upload histórico escolar
      this.fileStorageService.uploadFile({
        fileName: historicoEscolar.fileName,
        content: historicoEscolar.content,
      }),
    ]);

    // Handle upload results
    const [comprovanteResult, historicoResult] = uploadResults;

    // Update comprovante de residência if successful
    if (comprovanteResult.status === "fulfilled") {
      await this.documentoRepository.atualizarDocumento({
        id: comprovanteResidencia.id,
        url: comprovanteResult.value.url,
      });
    } else {
      console.error("Erro ao fazer upload do comprovante de residência:", comprovanteResult.reason);
    }

    // Update histórico escolar if successful
    if (historicoResult.status === "fulfilled") {
      await this.documentoRepository.atualizarDocumento({
        id: historicoEscolar.id,
        url: historicoResult.value.url,
      });
    } else {
      console.error("Erro ao fazer upload do histórico escolar:", historicoResult.reason);
    }
  }
}
