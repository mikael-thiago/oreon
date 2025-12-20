import type { StatusContrato } from "../enums/StatusContratoEnum.js";

export type UsuarioColaborador = {
  readonly id: number;
  readonly nome: string;
  readonly email: string;
  readonly senha: string;
};

export type ContratoAtivoColaborador = {
  readonly id: number;
  readonly dataInicio: Date;
  readonly dataFim?: Date | null;
  readonly cargoId: number;
  readonly status: StatusContrato;
};

export type ColaboradorArgs = {
  readonly id: number;
  readonly cpf: string;
  readonly email: string;
  readonly unidadeId: number;
  readonly ultimoContrato: ContratoAtivoColaborador;
  readonly usuario: UsuarioColaborador;
};

export class Colaborador {
  readonly id: number;
  readonly cpf: string;
  readonly email: string;
  readonly unidadeId: number;
  readonly ultimoContrato: ContratoAtivoColaborador;
  readonly usuario: UsuarioColaborador;

  constructor(args: ColaboradorArgs) {
    this.id = args.id;
    this.cpf = args.cpf;
    this.email = args.email;
    this.unidadeId = args.unidadeId;
    this.ultimoContrato = args.ultimoContrato;
    this.usuario = args.usuario;
  }
}
