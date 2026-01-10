import { and, count, eq, gte, lte, sql } from "drizzle-orm";
import { AnoLetivo } from "../../../domain/entities/ano-letivo.entity.js";
import type { AnoLetivoRepository } from "../../../domain/repositories/ano-letivo.repository.js";
import type { DrizzleService } from "./drizzle.service.js";
import { anoLetivoTable } from "./schema.js";

export class DrizzleAnoLetivoRepository implements AnoLetivoRepository {
  constructor(private readonly drizzleDb: DrizzleService) {}

  async obterProximoId(): Promise<number> {
    const res = await this.drizzleDb
      .getTransaction()
      .execute<{ readonly id: number }>(sql`SELECT NEXTVAL('school_periods_id_seq') AS "id"`);

    return res.rows[0]!.id;
  }

  async existe(id: number): Promise<boolean> {
    const [res] = await this.drizzleDb
      .getTransaction()
      .select({ count: count() })
      .from(anoLetivoTable)
      .where(eq(anoLetivoTable.id, id));

    return !res || res.count > 0;
  }

  async obterAnoLetivoPorAno(escolaId: number, ano: number): Promise<AnoLetivo | null> {
    const [anoLetivoModel] = await this.drizzleDb
      .getTransaction()
      .select()
      .from(anoLetivoTable)
      .where(and(eq(anoLetivoTable.schoolId, escolaId), eq(anoLetivoTable.year, ano)));

    if (!anoLetivoModel) {
      return null;
    }

    return new AnoLetivo({
      id: anoLetivoModel.id,
      anoReferencia: anoLetivoModel.year,
      dataInicio: anoLetivoModel.startDate,
      dataFim: anoLetivoModel.endDate,
      escolaId: anoLetivoModel.schoolId,
    });
  }

  async obterAnoLetivoPorData(escolaId: number, dataInicio: Date, dataFim: Date): Promise<AnoLetivo | null> {
    const [anoLetivoModel] = await this.drizzleDb
      .getTransaction()
      .select()
      .from(anoLetivoTable)
      .where(
        and(
          eq(anoLetivoTable.schoolId, escolaId),
          lte(anoLetivoTable.startDate, dataFim),
          gte(anoLetivoTable.endDate, dataInicio)
        )
      );

    if (!anoLetivoModel) {
      return null;
    }

    return new AnoLetivo({
      id: anoLetivoModel.id,
      anoReferencia: anoLetivoModel.year,
      dataInicio: anoLetivoModel.startDate,
      dataFim: anoLetivoModel.endDate,
      escolaId: anoLetivoModel.schoolId,
    });
  }

  async salvar(anoLetivo: AnoLetivo): Promise<AnoLetivo> {
    const [anoLetivoModel] = await this.drizzleDb
      .getTransaction()
      .insert(anoLetivoTable)
      .values({
        id: anoLetivo.id,
        year: anoLetivo.ano,
        startDate: anoLetivo.dataInicio,
        endDate: anoLetivo.dataFim,
        schoolId: anoLetivo.escolaId,
      })
      .returning({ id: anoLetivoTable.id });

    if (!anoLetivoModel) {
      throw new Error("Falha ao criar ano letivo");
    }

    return anoLetivo;
  }
}
