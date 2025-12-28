import type { RelacaoResponsabilidade } from "../enums/relacao-responsabilidade.enum.js";
import type { StatusSolicitacaoMatricula } from "../enums/status-solicitacao-matricula.enum.js";

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

  constructor(args: SolicitacaoMatriculaArgs) {
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
}
