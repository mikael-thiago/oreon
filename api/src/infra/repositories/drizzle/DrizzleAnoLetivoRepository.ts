import { and, count, eq, gte, lte } from "drizzle-orm";
import { AnoLetivo } from "../../../domain/entities/AnoLetivo.js";
import type { AnoLetivoRepository, CriarAnoLetivoRequest } from "../../../domain/repositories/AnoLetivoRepository.js";
import type { DrizzleService } from "./DrizzleService.js";
import { anoLetivoTable } from "./schema.js";

export class DrizzleAnoLetivoRepository implements AnoLetivoRepository {
  constructor(private readonly drizzleDb: DrizzleService) {}

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

  async criarAnoLetivo(request: CriarAnoLetivoRequest): Promise<AnoLetivo> {
    const [anoLetivoModel] = await this.drizzleDb
      .getTransaction()
      .insert(anoLetivoTable)
      .values({
        year: request.anoReferencia,
        startDate: request.dataInicio,
        endDate: request.dataFim,
        schoolId: request.escolaId,
      })
      .returning();

    if (!anoLetivoModel) {
      throw new Error("Falha ao criar ano letivo");
    }

    return new AnoLetivo({
      id: anoLetivoModel.id,
      anoReferencia: anoLetivoModel.year,
      dataInicio: anoLetivoModel.startDate,
      dataFim: anoLetivoModel.endDate,
      escolaId: anoLetivoModel.schoolId,
    });
  }
}
