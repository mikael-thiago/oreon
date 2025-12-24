export type DisciplinaListItem = {
  readonly id: number;
  readonly nome: string;
  readonly slug: string;
  readonly unidadeId: number | null;
};

export abstract class DisciplinaQueries {
  abstract listarDisciplinasPorUnidade(unidadeId: number): Promise<DisciplinaListItem[]>;
}
