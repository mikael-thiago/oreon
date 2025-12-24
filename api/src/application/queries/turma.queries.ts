export type ListarTurmasRequest = {
  readonly unidadeId: number;
  readonly anoLetivoId: number;
};

export type ListarTurmasResponse = {
  readonly id: number;
  readonly etapa: string;
  readonly letra: string;
  readonly baseCurricular: {
    readonly id: number;
    readonly codigo: string;
  };
};

export abstract class TurmaQueries {
  abstract listarTurmas(request: ListarTurmasRequest): Promise<ListarTurmasResponse[]>;
}
