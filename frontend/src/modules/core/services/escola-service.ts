export type UnidadeEscolarResponse = {
  readonly id: number;
  readonly nome: string;
  readonly cnpj: string;
  readonly telefone1: string;
  readonly telefone2: string | null;
  readonly cidade: string | null;
  readonly estado: string | null;
  readonly isMatriz: boolean;
};

export interface IEscolaService {
  obterUnidadesEscolares(): Promise<UnidadeEscolarResponse[]>;
}

const baseUrl = import.meta.env.VITE_API_URL!;

export class EscolaService implements IEscolaService {
  async obterUnidadesEscolares(): Promise<UnidadeEscolarResponse[]> {
    // await new Promise(resolve => setTimeout(resolve, 3_000));

    const result = await fetch(`${baseUrl}/escolas/unidades`, {
      credentials: "include",
    });

    if (!result.ok) throw Error(await result.json());

    return result.json();
  }
}

export const escolaService: IEscolaService = new EscolaService();
