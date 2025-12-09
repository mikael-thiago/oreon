export type ObterBaseResponse = {
  readonly id: number;
  readonly codigo: string;
  readonly etapa: string;
  readonly dataCriacao: Date;
  readonly unidadeId: number;
  readonly disciplinas: {
    readonly id: number;
    readonly nome: string;
    readonly cargaHorariaAnual: number;
  }[];
};

export type ListarBasesRequest = {
  readonly unidadeId: number;
  readonly etapaId?: number | undefined;
};

export abstract class BaseCurricularQueries {
  abstract listarBases(request: ListarBasesRequest): Promise<{ id: number; etapa: string; codigo: string }[]>;
  abstract obterBasePorId(id: number): Promise<ObterBaseResponse | null>;
}
