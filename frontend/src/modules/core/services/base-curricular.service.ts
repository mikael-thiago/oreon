export type ObterBaseResponse = {
  readonly id: number;
  readonly codigo: string;
  readonly etapa: string;
  readonly dataCriacao: Date;
  readonly escolaId: number;
  readonly disciplinas: {
    readonly id: number;
    readonly nome: string;
    readonly cargaHorariaAnual: number;
  }[];
};

export type CadastrarBaseCurricularRequest = {
  readonly etapaId: number;
  readonly unidadeId: number;
  readonly disciplinas: {
    readonly nome: string;
    readonly codigo: string;
    readonly cargaHorariaAnual: number;
  }[];
};

export interface IBaseCurricularService {
  obterBases(
    unidadeId: number,
    etapaId?: number
  ): Promise<
    { readonly id: number; readonly etapa: string; readonly codigo: string }[]
  >;
  obterTodas(): Promise<
    { readonly id: number; readonly etapa: string; readonly codigo: string }[]
  >;
  obterBasePorId(id: number): Promise<ObterBaseResponse>;
  cadastrar(data: CadastrarBaseCurricularRequest): Promise<void>;
}

export class BaseCurricularService implements IBaseCurricularService {
  async obterBasePorId(id: number): Promise<ObterBaseResponse> {
    const response = await fetch(`http://localhost:4000/bases/${id}`, {
      credentials: "include",
    });

    return response.json();
  }

  async obterBases(
    unidadeId: number,
    etapaId?: number
  ): Promise<
    { readonly id: number; readonly etapa: string; readonly codigo: string }[]
  > {
    const url = `http://localhost:4000/unidade/${unidadeId}/bases`;

    const search = new URLSearchParams();

    if (etapaId) search.append("etapaId", String(etapaId));

    const response = await fetch(`${url}?${search.toString()}`, {
      credentials: "include",
    });

    return response.json();
  }

  async obterTodas(): Promise<
    { readonly id: number; readonly etapa: string; readonly codigo: string }[]
  > {
    const response = await fetch(`http://localhost:4000/bases`, {
      credentials: "include",
    });

    return response.json();
  }

  async cadastrar(data: CadastrarBaseCurricularRequest): Promise<void> {
    const response = await fetch(`http://localhost:4000/bases`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }
  }
}

export const baseCurricularService: IBaseCurricularService =
  new BaseCurricularService();
