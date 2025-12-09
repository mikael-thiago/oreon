import { AnoLetivo } from "../entities/AnoLetivo.js";

export type CriarAnoLetivoRequest = {
  readonly anoReferencia: number;
  readonly dataInicio: Date;
  readonly dataFim: Date;
  readonly escolaId: number;
};

export abstract class AnoLetivoRepository {
  abstract existe(id: number): Promise<boolean>;
  abstract obterAnoLetivoPorAno(
    escolaId: number,
    ano: number
  ): Promise<AnoLetivo | null>;
  abstract obterAnoLetivoPorData(
    escolaId: number,
    dataInicio: Date,
    dataFim: Date
  ): Promise<AnoLetivo | null>;
  abstract criarAnoLetivo(request: CriarAnoLetivoRequest): Promise<AnoLetivo>;
}
