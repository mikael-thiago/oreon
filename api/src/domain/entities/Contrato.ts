import type { StatusContrato } from "../enums/StatusContratoEnum.js";

export interface Contrato {
  readonly id: number;
  readonly dataInicio: Date;
  readonly dataFim: Date | null;
  readonly cargoId: number;
  readonly unidadeId: number;
  readonly matricula: string;
  readonly status: StatusContrato;
}

export type ContratoComumArgs = {
  readonly id: number;
  readonly dataInicio: Date;
  readonly dataFim?: Date | null;
  readonly cargoId: number;
  readonly unidadeId: number;
  readonly matricula: string;
  readonly status: StatusContrato;
};

export class ContratoComum implements Contrato {
  readonly id: number;
  readonly dataInicio: Date;
  readonly dataFim: Date | null;
  readonly cargoId: number;
  readonly unidadeId: number;
  readonly matricula: string;
  readonly status: StatusContrato;

  constructor(args: ContratoComumArgs) {
    this.id = args.id;
    this.dataInicio = args.dataInicio;
    this.dataFim = args.dataFim ?? null;
    this.cargoId = args.cargoId;
    this.unidadeId = args.unidadeId;
    this.matricula = args.matricula;
    this.status = args.status;
  }
}

export type ContratoProfessorArgs = {
  readonly id: number;
  readonly dataInicio: Date;
  readonly dataFim?: Date | null;
  readonly cargoId: number;
  readonly unidadeId: number;
  readonly matricula: string;
  readonly status: StatusContrato;
  readonly disciplinas: { readonly disciplinaId: number; readonly etapaId: number }[];
};

export class ContratoProfessor implements Contrato {
  readonly id: number;
  readonly dataInicio: Date;
  readonly dataFim: Date | null;
  readonly cargoId: number;
  readonly unidadeId: number;
  readonly matricula: string;
  readonly status: StatusContrato;
  readonly disciplinas: { readonly disciplinaId: number; readonly etapaId: number }[];

  constructor(args: ContratoProfessorArgs) {
    this.id = args.id;
    this.dataInicio = args.dataInicio;
    this.dataFim = args.dataFim ?? null;
    this.cargoId = args.cargoId;
    this.unidadeId = args.unidadeId;
    this.matricula = args.matricula;
    this.status = args.status;
    this.disciplinas = args.disciplinas;
  }
}
