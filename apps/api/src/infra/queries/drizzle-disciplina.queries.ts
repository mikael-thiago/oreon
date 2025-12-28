import { eq, isNull, or } from "drizzle-orm";
import type { DisciplinaListItem, DisciplinaQueries } from "../../application/queries/disciplina.queries.js";
import type { DrizzleService } from "../repositories/drizzle/drizzle.service.js";
import { disciplinasTable } from "../repositories/drizzle/schema.js";

export class DrizzleDisciplinaQueries implements DisciplinaQueries {
  constructor(private readonly drizzle: DrizzleService) {}

  async listarDisciplinasPorUnidade(unidadeId: number): Promise<DisciplinaListItem[]> {
    const results = await this.drizzle
      .getTransaction()
      .select({
        id: disciplinasTable.id,
        nome: disciplinasTable.name,
        slug: disciplinasTable.slug,
        unidadeId: disciplinasTable.unitId,
      })
      .from(disciplinasTable)
      .where(or(eq(disciplinasTable.unitId, unidadeId), isNull(disciplinasTable.unitId)));

    return results.map((result) => ({
      id: result.id,
      nome: result.nome,
      slug: result.slug,
      unidadeId: result.unidadeId,
    }));
  }
}
