import {
  type StatusMatricula,
  StatusMatriculaEnum,
} from "../enums/status-matricula.enum.js";

export type ResultadoMatriculaArgs = {
  readonly matriculaId: number;
  readonly status: "Aprovacao" | "Reprovacao";
};

export class ResultadoMatricula {
  readonly matriculaId: number;
  readonly status: "Aprovacao" | "Reprovacao";

  constructor(args: ResultadoMatriculaArgs) {
    this.matriculaId = args.matriculaId;
    this.status = args.status;
  }
}

export type MatriculaArgs = {
  readonly id: number;
  readonly alunoId: number;
  readonly dataInicio: Date;
  readonly dataFim?: Date | null;
  readonly anoLetivoId: number;
  readonly turmaId: number;
  readonly status: StatusMatricula;
  readonly resultado?: ResultadoMatricula;
};

export class Matricula {
  readonly id: number;
  readonly alunoId: number;
  readonly anoLetivoId: number;
  readonly turmaId: number;
  readonly dataInicio: Date;
  readonly dataFim: Date | null;
  readonly status: StatusMatricula;
  readonly resultado: ResultadoMatricula | null;

  constructor(args: MatriculaArgs) {
    this.id = args.id;
    this.alunoId = args.alunoId;
    this.anoLetivoId = args.anoLetivoId;
    this.turmaId = args.turmaId;
    this.dataInicio = args.dataInicio;
    this.dataFim = args.dataFim ?? null;
    this.status = args.status;
    this.resultado = args.resultado ?? null;
  }

  estaAtiva() {
    return (
      this.status === StatusMatriculaEnum.Ativa ||
      this.status === StatusMatriculaEnum.Aprovada
    );
  }

  cancelarMatricula() {}
}
