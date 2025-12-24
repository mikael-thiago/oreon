export type AnoLetivoDto = {
  readonly id: number;
  readonly ano: number;
  readonly dataInicio: Date;
  readonly dataFim: Date;
};

export abstract class AnoLetivoQueries {
  abstract listarAnosLetivos(escolaId: number): Promise<AnoLetivoDto[]>;
}
