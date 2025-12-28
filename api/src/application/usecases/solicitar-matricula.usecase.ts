import { ConflictError } from "../../domain/errors/conflict.error.js";
import { ValidationError, type ValidationErrorItem } from "../../domain/errors/validation.error.js";
import type { AlunoRepository } from "../../domain/repositories/aluno.repository.js";
import type { AnoLetivoRepository } from "../../domain/repositories/ano-letivo.repository.js";
import type { SolicitacaoMatriculaRepository } from "../../domain/repositories/solicitacao-matricula.repository.js";
import type { ResponsavelRepository } from "../../domain/repositories/responsavel.repository.js";
import type { DocumentoRepository } from "../../domain/repositories/documento.repository.js";
import type { UnidadeEscolarRepository } from "../../domain/repositories/unidade-escola.repository.js";
import { StatusSolicitacaoMatriculaEnum } from "../../domain/enums/status-solicitacao-matricula.enum.js";
import type { Sexo } from "../../domain/enums/sexo.enum.js";
import type { RelacaoResponsabilidade } from "../../domain/enums/relacao-responsabilidade.enum.js";
import type { UnitOfWork } from "../interfaces/unit-of-work.interface.js";
import type { FileStorageService } from "../interfaces/file-storage.interface.js";
import { cpfEhValido } from "../../infra/utils/cpf.js";

export type SolicitarMatriculaRequest = {
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

  async executar(request: SolicitarMatriculaRequest) {
    const erros: ValidationErrorItem[] = [];

    if (!cpfEhValido(request.cpf)) {
      erros.push({ propriedade: "cpf", mensagem: `O CPF ${request.cpf} do aluno é invalido!` });
    }

    if (!cpfEhValido(request.responsavel.cpf)) {
      erros.push({
        propriedade: "responsavel.cpf",
        mensagem: `O CPF ${request.responsavel.cpf} do responsável é invalido!`,
      });
    }

    const idade = this.calcularIdade(request.dataDeNascimento);
    if (idade < 3 || idade > 100) {
      erros.push({ propriedade: "dataDeNascimento", mensagem: "Data de nascimento inválida" });
    }

    // Lançando exceção logo para evitar bater na base
    if (erros.length > 0) {
      throw ValidationError.semantico(erros);
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
      throw ValidationError.semantico(erros);
    }

    return this.uow.transact(async () => {
      const [aluno, responsavel] = await Promise.all([
        this.obterOuCriarAluno(request.cpf, {
          nome: request.nome,
          dataDeNascimento: request.dataDeNascimento,
          sexo: request.sexo,
        }),
        this.obterOuCriarResponsavel(request.responsavel.cpf, {
          nome: request.responsavel.nome,
          telefone: request.responsavel.telefone,
          email: request.responsavel.email,
          dataDeNascimento: request.responsavel.dataDeNascimento,
        }),
      ]);

      const solicitacaoExistente =
        await this.solicitacaoMatriculaRepository.obterSolicitacaoMatriculaPorEstudanteEPeriodoEscolar(
          aluno.id,
          request.periodoLetivoId
        );

      if (solicitacaoExistente) {
        throw new ConflictError("Já existe uma solicitação de matrícula para este aluno neste período letivo");
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

      const solicitacaoMatricula = await this.solicitacaoMatriculaRepository.criarSolicitacaoMatricula({
        unidadeId: request.unidadeId,
        estudanteId: aluno.id,
        responsavelId: responsavel.id,
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

      return solicitacaoMatricula.id;
    });
  }

  private async obterOuCriarAluno(
    cpf: string,
    dados: { nome: string; dataDeNascimento: Date; sexo: Sexo }
  ) {
    const aluno = await this.alunoRepository.obterAlunoPorCpf(cpf);

    if (aluno) return aluno;

    return this.alunoRepository.criarAluno({
      nome: dados.nome,
      cpf,
      dataDeNascimento: dados.dataDeNascimento,
      sexo: dados.sexo,
    });
  }

  private async obterOuCriarResponsavel(
    cpf: string,
    dados: { nome: string; telefone: string; email: string; dataDeNascimento: Date }
  ) {
    const responsavel = await this.responsavelRepository.obterResponsavelPorCpf(cpf);

    if (responsavel) return responsavel;

    return this.responsavelRepository.criarResponsavel({
      nome: dados.nome,
      cpf,
      telefone: dados.telefone,
      email: dados.email,
      dataDeNascimento: dados.dataDeNascimento,
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
