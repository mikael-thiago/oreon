import type { RelacaoResponsabilidade } from "../enums/relacao-responsabilidade.enum.js";
import type { StatusSolicitacaoMatricula } from "../enums/status-solicitacao-matricula.enum.js";
import { Result } from "../shared/result.js";

export type SolicitacaoMatriculaArgs = {
  readonly id: number;
  readonly unidadeId: number;
  readonly estudanteId: number;
  readonly responsavelId: number;
  readonly periodoEscolarId: number;
  readonly etapaId: number;
  readonly relacaoResponsabilidade: RelacaoResponsabilidade;
  readonly status: StatusSolicitacaoMatricula;
  readonly dataSolicitacao: Date;
  readonly comprovanteDeResidenciaId: number;
  readonly historicoEscolarId: number;
  readonly documentoAlunoId: number;
  readonly documentoResponsavelId: number;
  readonly observacoes: string | null;
};

export class SolicitacaoMatricula {
  readonly id: number;
  readonly unidadeId: number;
  readonly estudanteId: number;
  readonly responsavelId: number;
  readonly periodoEscolarId: number;
  readonly etapaId: number;
  readonly relacaoResponsabilidade: RelacaoResponsabilidade;
  readonly status: StatusSolicitacaoMatricula;
  readonly dataSolicitacao: Date;
  readonly comprovanteDeResidenciaId: number;
  readonly historicoEscolarId: number;
  readonly documentoAlunoId: number;
  readonly documentoResponsavelId: number;
  readonly observacoes: string | null;

  private constructor(args: SolicitacaoMatriculaArgs) {
    this.id = args.id;
    this.unidadeId = args.unidadeId;
    this.estudanteId = args.estudanteId;
    this.responsavelId = args.responsavelId;
    this.periodoEscolarId = args.periodoEscolarId;
    this.etapaId = args.etapaId;
    this.relacaoResponsabilidade = args.relacaoResponsabilidade;
    this.status = args.status;
    this.dataSolicitacao = args.dataSolicitacao;
    this.comprovanteDeResidenciaId = args.comprovanteDeResidenciaId;
    this.historicoEscolarId = args.historicoEscolarId;
    this.documentoAlunoId = args.documentoAlunoId;
    this.documentoResponsavelId = args.documentoResponsavelId;
    this.observacoes = args.observacoes;
  }

  /**
   * Reconstitui uma solicitação de matrícula a partir de dados já validados do banco de dados
   */
  static criar(dados: {
    readonly id: number;
    readonly unidadeId: number;
    readonly estudanteId: number;
    readonly responsavelId: number;
    readonly periodoEscolarId: number;
    readonly etapaId: number;
    readonly relacaoResponsabilidade: RelacaoResponsabilidade;
    readonly status: StatusSolicitacaoMatricula;
    readonly dataSolicitacao: Date;
    readonly comprovanteDeResidenciaId: number;
    readonly historicoEscolarId: number;
    readonly documentoAlunoId: number;
    readonly documentoResponsavelId: number;
    readonly observacoes: string | null;
  }): Result<SolicitacaoMatricula> {
    return Result.ok(
      new SolicitacaoMatricula({
        id: dados.id,
        unidadeId: dados.unidadeId,
        estudanteId: dados.estudanteId,
        responsavelId: dados.responsavelId,
        periodoEscolarId: dados.periodoEscolarId,
        etapaId: dados.etapaId,
        relacaoResponsabilidade: dados.relacaoResponsabilidade,
        status: dados.status,
        dataSolicitacao: dados.dataSolicitacao,
        comprovanteDeResidenciaId: dados.comprovanteDeResidenciaId,
        historicoEscolarId: dados.historicoEscolarId,
        documentoAlunoId: dados.documentoAlunoId,
        documentoResponsavelId: dados.documentoResponsavelId,
        observacoes: dados.observacoes,
      })
    );
  }

  /**
   * Reconstitui uma solicitação de matrícula a partir de dados já validados do banco de dados
   */
  static reconstituir(dados: {
    readonly id: number;
    readonly unidadeId: number;
    readonly estudanteId: number;
    readonly responsavelId: number;
    readonly periodoEscolarId: number;
    readonly etapaId: number;
    readonly relacaoResponsabilidade: RelacaoResponsabilidade;
    readonly status: StatusSolicitacaoMatricula;
    readonly dataSolicitacao: Date;
    readonly comprovanteDeResidenciaId: number;
    readonly historicoEscolarId: number;
    readonly documentoAlunoId: number;
    readonly documentoResponsavelId: number;
    readonly observacoes: string | null;
  }): SolicitacaoMatricula {
    return new SolicitacaoMatricula({
      id: dados.id,
      unidadeId: dados.unidadeId,
      estudanteId: dados.estudanteId,
      responsavelId: dados.responsavelId,
      periodoEscolarId: dados.periodoEscolarId,
      etapaId: dados.etapaId,
      relacaoResponsabilidade: dados.relacaoResponsabilidade,
      status: dados.status,
      dataSolicitacao: dados.dataSolicitacao,
      comprovanteDeResidenciaId: dados.comprovanteDeResidenciaId,
      historicoEscolarId: dados.historicoEscolarId,
      documentoAlunoId: dados.documentoAlunoId,
      documentoResponsavelId: dados.documentoResponsavelId,
      observacoes: dados.observacoes,
    });
  }
}
