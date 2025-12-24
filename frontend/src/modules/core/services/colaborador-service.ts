import type { StatusContrato } from "../types/status-contrato.enum";

export type ListarColaboradoresResponse = {
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
    readonly status: string;
    readonly dataInicio: string;
    readonly dataFim: string | null;
    readonly cargo: string;
  };
}

export type DetalhesColaboradorResponse = {
  readonly id: number;
  readonly nome: string;
  readonly email: string;
  readonly cpf: string;
  readonly telefone: string;
  readonly contratos: {
    readonly id: number;
    readonly dataInicio: string;
    readonly dataFim?: string | null;
    readonly cargoId: number;
    readonly cargoNome: string;
    readonly matricula: string;
    readonly status: StatusContrato;
    readonly salario: number;
  }[];
}

export type CadastrarColaboradorRequest = {
  readonly nome: string;
  readonly cpf: string;
  readonly telefone: string;
  readonly email: string;
  readonly unidadeId: number;
  readonly contrato: {
    readonly cargoId: number;
    readonly salario: number;
    readonly dataInicio: Date;
    readonly dataFim?: Date;
    readonly disciplinasPermitidas?: {
      readonly disciplinaId: number;
      readonly etapasIds: number[];
    }[];
  };
}

export interface IColaboradorService {
  listarColaboradores(unidadeId?: number | null): Promise<ListarColaboradoresResponse[]>;
  obterDetalhes(unidadeId: number, colaboradorId: number): Promise<DetalhesColaboradorResponse>;
  cadastrar(data: CadastrarColaboradorRequest): Promise<void>;
}

export class ColaboradorService implements IColaboradorService {
  async listarColaboradores(unidadeId?: number): Promise<ListarColaboradoresResponse[]> {
    const searchParams = new URLSearchParams();

    if (unidadeId) {
      searchParams.append('unidadeId', String(unidadeId));
    }

    const response = await fetch(`http://localhost:4000/colaboradores?${searchParams.toString()}`, {
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  }

  async obterDetalhes(unidadeId: number, colaboradorId: number): Promise<DetalhesColaboradorResponse> {
    const response = await fetch(`http://localhost:4000/unidades/${unidadeId}/colaboradores/${colaboradorId}`, {
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  }

  async cadastrar(data: CadastrarColaboradorRequest): Promise<void> {
    const response = await fetch(`http://localhost:4000/colaboradores`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome: data.nome,
        cpf: data.cpf,
        telefone: data.telefone,
        email: data.email,
        unidadeId: data.unidadeId,
        contrato: {
          cargoId: data.contrato.cargoId,
          salario: data.contrato.salario,
          dataInicio: data.contrato.dataInicio.toISOString().split("T")[0],
          dataFim: data.contrato.dataFim
            ? data.contrato.dataFim.toISOString().split("T")[0]
            : undefined,
          disciplinasPermitidas: data.contrato.disciplinasPermitidas,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }
  }
}

export const colaboradorService: IColaboradorService = new ColaboradorService();
