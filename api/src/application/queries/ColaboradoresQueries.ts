import type { StatusContrato } from "../../domain/enums/StatusContratoEnum.js";

export type ColaboradorListItem = {
  readonly id: number;
  readonly nome: string;
  readonly email: string;
  readonly cpf: string;
  readonly telefone: string;
  readonly unidade: {
    readonly id: number;
    readonly cnpj: string;
    readonly nome: string;
  };
  readonly contrato: {
    readonly id: number;
    readonly status: StatusContrato;
    readonly dataInicio: string;
    readonly dataFim: string | null;
    readonly cargo: string;
  };
};

export abstract class ColaboradoresQueries {
  abstract listarColaboradores(escolaId: number, unidadeId?: number): Promise<ColaboradorListItem[]>;
}
