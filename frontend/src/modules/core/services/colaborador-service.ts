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

export type CadastrarColaboradorRequest = {
  readonly nome: string;
  readonly cpf: string;
  readonly telefone: string;
  readonly email: string;
  readonly unidadeId: number;
  readonly contrato: {
    readonly cargoId: number;
    readonly dataInicio: Date;
    readonly dataFim?: Date;
  };
}

export interface IColaboradorService {
  listarColaboradores(unidadeId?: number | null): Promise<ListarColaboradoresResponse[]>;
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
          dataInicio: data.contrato.dataInicio.toISOString().split("T")[0],
          dataFim: data.contrato.dataFim
            ? data.contrato.dataFim.toISOString().split("T")[0]
            : undefined,
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
