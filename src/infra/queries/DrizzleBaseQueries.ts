import { eq } from "drizzle-orm";
import type { drizzle } from "drizzle-orm/node-postgres";
import type { BaseCurricularQueries } from "../../application/queries/BaseQueries.js";
import {
  baseCurricularTable,
  etapaTable,
} from "../repositories/drizzle/schema.js";

export class DrizzleBaseQueries implements BaseCurricularQueries {
  constructor(private readonly db: ReturnType<typeof drizzle>) {}

  listarBases(): Promise<{ id: number; etapa: string; codigo: string }[]> {
    return this.db
      .select({
        id: baseCurricularTable.id,
        codigo: baseCurricularTable.code,
        etapa: etapaTable.name,
      })
      .from(baseCurricularTable)
      .innerJoin(etapaTable, eq(baseCurricularTable.stepId, etapaTable.id));
  }
}
