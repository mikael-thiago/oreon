import { asc, eq } from "drizzle-orm";
import type { AnoLetivoDto, AnoLetivoQueries } from "../../application/queries/ano-letivo.queries.js";
import type { DrizzleService } from "../repositories/drizzle/drizzle.service.js";
import { anoLetivoTable } from "../repositories/drizzle/schema.js";

export class DrizzleAnoLetivoQueries implements AnoLetivoQueries {
  constructor(private readonly db: DrizzleService) {}

  async listarAnosLetivos(escolaId: number): Promise<AnoLetivoDto[]> {
    const anosLetivos = await this.db
      .getTransaction()
      .select({
        id: anoLetivoTable.id,
        ano: anoLetivoTable.year,
        dataInicio: anoLetivoTable.startDate,
        dataFim: anoLetivoTable.endDate,
      })
      .from(anoLetivoTable)
      .where(eq(anoLetivoTable.schoolId, escolaId))
      .orderBy(asc(anoLetivoTable.year));

    return anosLetivos;
  }
}
