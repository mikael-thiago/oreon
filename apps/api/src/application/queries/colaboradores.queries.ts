import type { StatusContrato } from "../../domain/enums/status-contrato.enum.js";

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

export type DetalhesColaborador = {
  readonly id: number;
  readonly nome: string;
  readonly email: string;
  readonly cpf: string;
  readonly telefone: string;
  readonly contratos: {
    readonly id: number;
    readonly dataInicio: Date;
    readonly dataFim?: Date | null;
    readonly cargoId: number;
    readonly cargoNome: string;
    readonly matricula: string;
    readonly status: StatusContrato;
    readonly salario: number;
  }[];
};

export abstract class ColaboradoresQueries {
  abstract listarColaboradores(escolaId: number, unidadeId?: number): Promise<ColaboradorListItem[]>;
  abstract obterDetalhesDoColaboradorPorId(id: number): Promise<any>;
}
