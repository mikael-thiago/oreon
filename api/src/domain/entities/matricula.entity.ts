import type { StatusMatricula } from "../enums/status-matricula.enum.js";

export type MatriculaArgs = {
  readonly id: number;
  readonly unidadeId: number;
  readonly estudanteId: number;
  readonly periodoLetivoId: number;
  readonly status: StatusMatricula;
  readonly dataCriacao: Date;
  readonly comprovanteResidenciaId: number;
  readonly historicoEscolarId: number;
};

export class Matricula {
  readonly id: number;
  readonly unidadeId: number;
  readonly estudanteId: number;
  readonly periodoLetivoId: number;
  readonly status: StatusMatricula;
  readonly dataCriacao: Date;
  readonly comprovanteResidenciaId: number;
  readonly historicoEscolarId: number;

  constructor(args: MatriculaArgs) {
    this.id = args.id;
    this.unidadeId = args.unidadeId;
    this.estudanteId = args.estudanteId;
    this.periodoLetivoId = args.periodoLetivoId;
    this.status = args.status;
    this.dataCriacao = args.dataCriacao;
    this.comprovanteResidenciaId = args.comprovanteResidenciaId;
    this.historicoEscolarId = args.historicoEscolarId;
  }
}
