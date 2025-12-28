export type ListarTurmasResponse = {
  readonly id: number;
  readonly etapa: string;
  readonly letra: string;
  readonly baseCurricular: {
    readonly id: number;
    readonly codigo: string;
  };
}[];

export interface CadastrarTurmaRequest {
  readonly anoLetivoId: number;
  readonly baseId: number;
  readonly etapaId: number;
  readonly letra: string;
  readonly unidadeId: number;
}

export interface ITurmaService {
  listarTurmas(
    unidadeId: number,
    anoLetivoId: number
  ): Promise<ListarTurmasResponse>;
  cadastrar(data: CadastrarTurmaRequest): Promise<void>;
}

export class TurmaService implements ITurmaService {
  async listarTurmas(
    unidadeId: number,
    anoLetivoId: number
  ): Promise<ListarTurmasResponse> {
    const response = await fetch(
      `http://localhost:4000/unidade/${unidadeId}/anoLetivo/${anoLetivoId}/turmas`,
      {
        credentials: "include",
      }
    );

    return response.json();
  }

  async cadastrar(data: CadastrarTurmaRequest): Promise<void> {
    const response = await fetch(`http://localhost:4000/turmas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }
  }
}

export const turmaService: ITurmaService = new TurmaService();
