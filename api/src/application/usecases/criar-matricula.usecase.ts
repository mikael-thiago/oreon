import { ConflictError } from "../../domain/errors/conflict.error.js";
import { ValidationError } from "../../domain/errors/validation.error.js";
import type { AlunoRepository } from "../../domain/repositories/aluno.repository.js";
import type { AnoLetivoRepository } from "../../domain/repositories/ano-letivo.repository.js";
import type { MatriculaRepository } from "../../domain/repositories/matricula.repository.js";
import type { DocumentoRepository } from "../../domain/repositories/documento.repository.js";
import type { UnidadeEscolarRepository } from "../../domain/repositories/unidade-escola.repository.js";
import { StatusMatriculaEnum } from "../../domain/enums/status-matricula.enum.js";
import type { UnitOfWork } from "../interfaces/unit-of-work.interface.js";
import type { FileStorageService } from "../interfaces/file-storage.interface.js";
import { cpfEhValido } from "../../infra/utils/cpf.js";

export type CriarMatriculaRequest = {
  readonly cpf: string;
  readonly nome: string;
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

  async executar(request: CriarMatriculaRequest) {
    // Validate CPF format
    if (!cpfEhValido(request.cpf)) {
      throw ValidationError.semantico([
        { propriedade: "cpf", mensagem: `O CPF ${request.cpf} é invalido!` },
      ]);
    }

    // Validate birthDate (age between 3 and 100 years)
    const idade = this.calcularIdade(request.dataDeNascimento);
    if (idade < 3 || idade > 100) {
      throw ValidationError.semantico([
        { propriedade: "dataDeNascimento", mensagem: "Data de nascimento inválida" },
      ]);
    }

    // Parallel validation of unit and school period existence
    const [unidadeExiste, periodoLetivoExiste] = await Promise.all([
      this.unidadeEscolarRepository.existeComId(request.unidadeId),
      this.anoLetivoRepository.existe(request.periodoLetivoId),
    ]);

    // Collect validation errors
    const erros = [];

    if (!unidadeExiste) {
      erros.push({
        propriedade: "unidadeId",
        mensagem: `Unidade escolar com id ${request.unidadeId} não existe`,
      });
    }

    if (!periodoLetivoExiste) {
      erros.push({
        propriedade: "periodoLetivoId",
        mensagem: `Período letivo com id ${request.periodoLetivoId} não existe`,
      });
    }

    // Throw validation error if any validations failed
    if (erros.length > 0) {
      throw ValidationError.semantico(erros);
    }

    // Execute transaction to create/retrieve student and create matriculation
    return this.uow.transact(async () => {
      // Check if student exists by CPF
      let aluno = await this.alunoRepository.obterAlunoPorCpf(request.cpf);

      // If student doesn't exist, create new one
      if (!aluno) {
        aluno = await this.alunoRepository.criarAluno({
          nome: request.nome,
          cpf: request.cpf,
          dataDeNascimento: request.dataDeNascimento,
        });
      }

      // Check for existing matriculation
      const matriculaExistente = await this.matriculaRepository.obterMatriculaPorEstudanteEPeriodoLetivo(
        aluno.id,
        request.periodoLetivoId
      );

      if (matriculaExistente) {
        throw new ConflictError("Já existe uma matrícula para este aluno neste período letivo");
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
      const matricula = await this.matriculaRepository.criarMatricula({
        unidadeId: request.unidadeId,
        estudanteId: aluno.id,
        periodoLetivoId: request.periodoLetivoId,
        status: StatusMatriculaEnum.Ativa,
        dataCriacao: new Date(),
        comprovanteResidenciaId: comprovanteResidenciaDoc.id,
        historicoEscolarId: historicoEscolarDoc.id,
      });

      return matricula.id;
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
