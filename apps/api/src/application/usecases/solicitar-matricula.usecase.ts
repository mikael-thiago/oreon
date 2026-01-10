import { Aluno } from "../../domain/entities/aluno.entity.js";
import { Responsavel } from "../../domain/entities/responsavel.entity.js";
import { SolicitacaoMatricula } from "../../domain/entities/solicitacao-matricula.entity.js";
import type { RelacaoResponsabilidade } from "../../domain/enums/relacao-responsabilidade.enum.js";
import type { Sexo } from "../../domain/enums/sexo.enum.js";
import { StatusSolicitacaoMatriculaEnum } from "../../domain/enums/status-solicitacao-matricula.enum.js";
import { ConflictError } from "../../domain/errors/conflict.error.js";
import { ValidationError, type ValidationErrorItem } from "../../domain/errors/validation.error.js";
import type { AlunoRepository } from "../../domain/repositories/aluno.repository.js";
import type { AnoLetivoRepository } from "../../domain/repositories/ano-letivo.repository.js";
import type { DocumentoRepository } from "../../domain/repositories/documento.repository.js";
import type { ResponsavelRepository } from "../../domain/repositories/responsavel.repository.js";
import type { SolicitacaoMatriculaRepository } from "../../domain/repositories/solicitacao-matricula.repository.js";
import type { UnidadeEscolarRepository } from "../../domain/repositories/unidade-escola.repository.js";
import { Result, type OkResult } from "../../domain/shared/result.js";
import { CPF } from "../../domain/value-objects/cpf.vo.js";
import type { FileStorageService } from "../interfaces/file-storage.interface.js";
import type { UnitOfWork } from "../interfaces/unit-of-work.interface.js";
import type { UsuarioAutenticado } from "../types/authenticated-user.type.js";

export type SolicitarMatriculaRequest = {
  readonly usuarioAutenticado: UsuarioAutenticado;
  readonly cpf: string;
  readonly nome: string;
  readonly sexo: Sexo;
  readonly dataDeNascimento: Date;
  readonly unidadeId: number;
  readonly periodoLetivoId: number;
  readonly etapaId: number;
  readonly relacaoResponsabilidade: RelacaoResponsabilidade;
  readonly observacoes?: string | undefined;
  readonly responsavel: {
    readonly nome: string;
    readonly cpf: string;
    readonly telefone: string;
    readonly email: string;
    readonly dataDeNascimento: Date;
  };
  readonly comprovanteResidencia: {
    readonly fileName: string;
    readonly content: Buffer;
  };
  readonly historicoEscolar: {
    readonly fileName: string;
    readonly content: Buffer;
  };
  readonly documentoAluno: {
    readonly fileName: string;
    readonly content: Buffer;
  };
  readonly documentoResponsavel: {
    readonly fileName: string;
    readonly content: Buffer;
  };
};

export class SolicitarMatriculaUseCase {
  constructor(
    private readonly alunoRepository: AlunoRepository,
    private readonly responsavelRepository: ResponsavelRepository,
    private readonly unidadeEscolarRepository: UnidadeEscolarRepository,
    private readonly anoLetivoRepository: AnoLetivoRepository,
    private readonly solicitacaoMatriculaRepository: SolicitacaoMatriculaRepository,
    private readonly documentoRepository: DocumentoRepository,
    private readonly fileStorageService: FileStorageService,
    private readonly uow: UnitOfWork
  ) {}

  async executar(request: SolicitarMatriculaRequest): Promise<Result<number, ValidationError | ConflictError>> {
    const erros: ValidationErrorItem[] = [];

    const cpfResult = CPF.criar(request.cpf);

    if (Result.isFailure(cpfResult)) {
      erros.push({ propriedade: "cpf", mensagem: cpfResult.erro.message });
    }
    
    const cpfResponsavelResult = CPF.criar(request.responsavel.cpf);
    
    if (Result.isFailure(cpfResponsavelResult)) {
      erros.push({ propriedade: "responsavel.cpf", mensagem: cpfResponsavelResult.erro.message });
    }

    // Lançando exceção logo para evitar bater na base
    if (erros.length > 0) {
      return Result.fail(ValidationError.semantico(erros));
    }

    const [unidadeExiste, periodoLetivoExiste] = await Promise.all([
      this.unidadeEscolarRepository.existeComId(request.unidadeId),
      this.anoLetivoRepository.existe(request.periodoLetivoId),
    ]);

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

    if (erros.length > 0) {
      return Result.fail(ValidationError.semantico(erros));
    }

    return this.uow.transact(async () => {
      const [aluno, responsavel] = await Promise.all([
        this.obterOuCriarAluno((cpfResult as OkResult<CPF>).value, {
          nome: request.nome,
          dataDeNascimento: request.dataDeNascimento,
          sexo: request.sexo,
          escolaId: request.usuarioAutenticado.escolaId,
        }),
        this.obterOuCriarResponsavel((cpfResponsavelResult as OkResult<CPF>).value, {
          nome: request.responsavel.nome,
          telefone: request.responsavel.telefone,
          email: request.responsavel.email,
          dataDeNascimento: request.responsavel.dataDeNascimento,
          escolaId: request.usuarioAutenticado.escolaId,
        }),
      ]);

      if (Result.isFailure(aluno) || Result.isFailure(responsavel)) {
        return Result.fail(
          ValidationError.semantico([
            ...(Result.isFailure(aluno) ? aluno.erro.erros : []),
            ...(Result.isFailure(responsavel) ? responsavel.erro.erros : []),
          ])
        );
      }

      const solicitacaoExistente =
        await this.solicitacaoMatriculaRepository.obterSolicitacaoMatriculaPorEstudanteEPeriodoEscolar(
          aluno.value.id,
          request.periodoLetivoId
        );

      if (solicitacaoExistente) {
        return Result.fail(
          new ConflictError("Já existe uma solicitação de matrícula para este aluno neste período letivo")
        );
      }

      const [comprovanteResidenciaDoc, historicoEscolarDoc, documentoAlunoDoc, documentoResponsavelDoc] =
        await Promise.all([
          this.documentoRepository.criarDocumento({
            conteudo: request.comprovanteResidencia.content.toString("base64"),
          }),
          this.documentoRepository.criarDocumento({
            conteudo: request.historicoEscolar.content.toString("base64"),
          }),
          this.documentoRepository.criarDocumento({
            conteudo: request.documentoAluno.content.toString("base64"),
          }),
          this.documentoRepository.criarDocumento({
            conteudo: request.documentoResponsavel.content.toString("base64"),
          }),
        ]);

      // Agenda upload para momento futuro, para evitar bloquear a operação por falha no upload
      setImmediate(() =>
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
          },
          {
            id: documentoAlunoDoc.id,
            fileName: request.documentoAluno.fileName,
            content: request.documentoAluno.content,
          },
          {
            id: documentoResponsavelDoc.id,
            fileName: request.documentoResponsavel.fileName,
            content: request.documentoResponsavel.content,
          }
        )
      );

      const solicitacaoMatriculaResult = SolicitacaoMatricula.criar({
        id: await this.solicitacaoMatriculaRepository.obterProximoId(),
        unidadeId: request.unidadeId,
        estudanteId: aluno.value.id,
        responsavelId: responsavel.value.id,
        periodoEscolarId: request.periodoLetivoId,
        etapaId: request.etapaId,
        relacaoResponsabilidade: request.relacaoResponsabilidade,
        status: StatusSolicitacaoMatriculaEnum.EmAndamento,
        dataSolicitacao: new Date(),
        comprovanteDeResidenciaId: comprovanteResidenciaDoc.id,
        historicoEscolarId: historicoEscolarDoc.id,
        documentoAlunoId: documentoAlunoDoc.id,
        documentoResponsavelId: documentoResponsavelDoc.id,
        observacoes: request.observacoes ?? null,
      });

      if (Result.isFailure(solicitacaoMatriculaResult)) {
        return Result.fail(ValidationError.semantico([]));
      }

      const solicitacaoMatricula = await this.solicitacaoMatriculaRepository.salvar(solicitacaoMatriculaResult.value);

      return Result.ok(solicitacaoMatricula.id);
    });
  }

  private async obterOuCriarAluno(
    cpf: CPF,
    dados: Readonly<{ nome: string; dataDeNascimento: Date; sexo: Sexo; escolaId: number }>
  ): Promise<Result<Aluno, ValidationError>> {
    const aluno = await this.alunoRepository.obterAlunoPorCpf(cpf.getValor());

    if (aluno) return Result.ok(aluno);

    const alunoResult = Aluno.criar({
      id: await this.alunoRepository.obterProximoId(),
      cpf: cpf.getValor(),
      dataDeNascimento: dados.dataDeNascimento,
      nome: dados.nome,
      sexo: dados.sexo,
      escolaId: dados.escolaId,
    });

    if (Result.isFailure(alunoResult)) {
      return alunoResult;
    }

    await this.alunoRepository.salvar(alunoResult.value);

    return alunoResult;
  }

  private async obterOuCriarResponsavel(
    cpf: CPF,
    dados: Readonly<{ nome: string; telefone: string; email: string; dataDeNascimento: Date; escolaId: number }>
  ): Promise<Result<Responsavel, ValidationError>> {
    const responsavel = await this.responsavelRepository.obterResponsavelPorCpf(cpf.getValor());

    if (responsavel) return Result.ok(responsavel);

    const novoResponsavelResult = Responsavel.criar({
      id: await this.responsavelRepository.obterProximoId(),
      nome: dados.nome,
      cpf: cpf.getValor(),
      telefone: dados.telefone,
      email: dados.email,
      dataDeNascimento: dados.dataDeNascimento,
      escolaId: dados.escolaId,
    });

    if (Result.isFailure(novoResponsavelResult)) return novoResponsavelResult;

    await this.responsavelRepository.salvar(novoResponsavelResult.value);

    return novoResponsavelResult;
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
    historicoEscolar: { id: number; fileName: string; content: Buffer },
    documentoAluno: { id: number; fileName: string; content: Buffer },
    documentoResponsavel: { id: number; fileName: string; content: Buffer }
  ): Promise<void> {
    const [comprovanteResult, historicoResult, alunoDocResult, responsavelDocResult] = await Promise.allSettled([
      this.fileStorageService.uploadFile({
        fileName: comprovanteResidencia.fileName,
        content: comprovanteResidencia.content,
      }),
      this.fileStorageService.uploadFile({
        fileName: historicoEscolar.fileName,
        content: historicoEscolar.content,
      }),
      this.fileStorageService.uploadFile({
        fileName: documentoAluno.fileName,
        content: documentoAluno.content,
      }),
      this.fileStorageService.uploadFile({
        fileName: documentoResponsavel.fileName,
        content: documentoResponsavel.content,
      }),
    ]);

    if (comprovanteResult.status === "fulfilled") {
      await this.documentoRepository.atualizarDocumento({
        id: comprovanteResidencia.id,
        url: comprovanteResult.value.url,
      });
    } else {
      console.error("Erro ao fazer upload do comprovante de residência:", comprovanteResult.reason);
    }

    if (historicoResult.status === "fulfilled") {
      await this.documentoRepository.atualizarDocumento({
        id: historicoEscolar.id,
        url: historicoResult.value.url,
      });
    } else {
      console.error("Erro ao fazer upload do histórico escolar:", historicoResult.reason);
    }

    if (alunoDocResult.status === "fulfilled") {
      await this.documentoRepository.atualizarDocumento({
        id: documentoAluno.id,
        url: alunoDocResult.value.url,
      });
    } else {
      console.error("Erro ao fazer upload do documento do aluno:", alunoDocResult.reason);
    }

    if (responsavelDocResult.status === "fulfilled") {
      await this.documentoRepository.atualizarDocumento({
        id: documentoResponsavel.id,
        url: responsavelDocResult.value.url,
      });
    } else {
      console.error("Erro ao fazer upload do documento do responsável:", responsavelDocResult.reason);
    }
  }
}
