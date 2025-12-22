import { and, eq, sql, SQL } from "drizzle-orm";
import type {
  BaseCurricularQueries,
  ListarBasesRequest,
  ObterBaseResponse,
} from "../../application/queries/BaseQueries.js";
import type { DrizzleService } from "../repositories/drizzle/DrizzleService.js";
import { baseCurricularTable, baseDisciplinaTable, disciplinasTable, etapaTable, modalidadeTable } from "../repositories/drizzle/schema.js";

export class DrizzleBaseQueries implements BaseCurricularQueries {
  constructor(private readonly db: DrizzleService) {}

  listarBases({ unidadeId, etapaId }: ListarBasesRequest): Promise<{ id: number; etapa: string; codigo: string }[]> {
    const conditions: SQL[] = [eq(baseCurricularTable.unitId, unidadeId)];

    if (etapaId) {
      conditions.push(eq(baseCurricularTable.stepId, etapaId));
    }

    return this.db
      .getTransaction()
      .select({
        id: baseCurricularTable.id,
        codigo: baseCurricularTable.code,
        etapa: sql<string>`${etapaTable.name} ||' do ' || ${modalidadeTable.name}`,
      })
      .from(baseCurricularTable)
      .innerJoin(etapaTable, eq(baseCurricularTable.stepId, etapaTable.id))
      .innerJoin(modalidadeTable, eq(etapaTable.modalityId, modalidadeTable.id))
      .where(and(...conditions))
      .orderBy(etapaTable.name);
  }

  async obterBasePorId(id: number): Promise<ObterBaseResponse | null> {
    const rows = await this.db
      .getTransaction()
      .select({
        id: baseCurricularTable.id,
        codigo: baseCurricularTable.code,
        etapa: etapaTable.name,
        dataCriacao: baseCurricularTable.creationDate,
        unidadeId: baseCurricularTable.unitId,
        disciplinaId: disciplinasTable.id,
        disciplinaNome: disciplinasTable.name,
        disciplinaCargaHorariaAnual: baseDisciplinaTable.annual_workload,
      })
      .from(baseCurricularTable)
      .innerJoin(etapaTable, eq(baseCurricularTable.stepId, etapaTable.id))
      .leftJoin(baseDisciplinaTable, eq(baseDisciplinaTable.baseId, baseCurricularTable.id))
      .leftJoin(disciplinasTable, eq(disciplinasTable.id, baseDisciplinaTable.disciplineId))
      .where(eq(baseCurricularTable.id, id));

    if (rows.length === 0) {
      return null;
    }

    const firstRow = rows[0]!;
    const disciplinas = rows
      .filter((row) => row.disciplinaId !== null)
      .map((row) => ({
        id: row.disciplinaId!,
        nome: row.disciplinaNome!,
        cargaHorariaAnual: row.disciplinaCargaHorariaAnual!,
      }));

    return {
      id: firstRow.id,
      codigo: firstRow.codigo,
      etapa: firstRow.etapa,
      dataCriacao: firstRow.dataCriacao,
      unidadeId: firstRow.unidadeId,
      disciplinas,
    };
  }
}
