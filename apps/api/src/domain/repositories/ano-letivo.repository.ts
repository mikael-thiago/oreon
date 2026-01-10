import { AnoLetivo } from "../entities/ano-letivo.entity.js";

export abstract class AnoLetivoRepository {
  abstract obterProximoId(): Promise<number>;
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
  abstract salvar(anoLetivo: AnoLetivo): Promise<AnoLetivo>;
}
