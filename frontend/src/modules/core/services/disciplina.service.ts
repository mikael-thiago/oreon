export type DisciplinaListItem = {
  readonly id: number;
  readonly nome: string;
  readonly slug: string;
  readonly unidadeId: number | null;
};

export interface IDisciplinaService {
  obterDisciplinas(unidadeId: number): Promise<DisciplinaListItem[]>;
}

export class DisciplinaService implements IDisciplinaService {
  async obterDisciplinas(unidadeId: number): Promise<DisciplinaListItem[]> {
    const response = await fetch(
      `http://localhost:4000/unidades/${unidadeId}/disciplinas`,
      { credentials: "include" }
    );

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  }
}

export const disciplinaService: IDisciplinaService = new DisciplinaService();
