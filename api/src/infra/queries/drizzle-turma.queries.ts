import { and, eq } from "drizzle-orm";
import type {
  ListarTurmasRequest,
  ListarTurmasResponse,
  TurmaQueries,
} from "../../application/queries/turma.queries.js";
import type { DrizzleService } from "../repositories/drizzle/drizzle.service.js";
import { baseCurricularTable, etapaTable, turmaTable, unidadeTable } from "../repositories/drizzle/schema.js";

export class DrizzleTurmaQueries implements TurmaQueries {
  constructor(private readonly db: DrizzleService) {}

  async listarTurmas(request: ListarTurmasRequest): Promise<ListarTurmasResponse[]> {
    console.log(request);

    const turmas = await this.db
      .getTransaction()
      .select({
        id: turmaTable.id,
        etapa: etapaTable.name,
        letra: turmaTable.letter,
        baseCurricular: {
          id: baseCurricularTable.id,
          codigo: baseCurricularTable.code,
        },
      })
      .from(turmaTable)
      .innerJoin(etapaTable, eq(turmaTable.etapaId, etapaTable.id))
      .innerJoin(unidadeTable, eq(turmaTable.unitId, unidadeTable.id))
      .innerJoin(
        baseCurricularTable,
        and(eq(baseCurricularTable.stepId, etapaTable.id), eq(baseCurricularTable.unitId, unidadeTable.id))
      )
      .where(and(eq(turmaTable.unitId, request.unidadeId), eq(turmaTable.schoolPeriodId, request.anoLetivoId)))
      .orderBy(etapaTable.name, turmaTable.letter);

    return turmas;
  }
}
