import { count, eq } from "drizzle-orm";
import type { PgInsertValue } from "drizzle-orm/pg-core";
import { BaseCurricular } from "../../../domain/entities/BaseCurricular.js";
import { Disciplina } from "../../../domain/entities/Disciplina.js";
import type { BaseCurricularRepository } from "../../../domain/repositories/BaseCurricularRepository.js";
import type { DrizzleService } from "./DrizzleService.js";
import { baseCurricularTable, disciplinaTable } from "./schema.js";

export class DrizzleBaseRepository implements BaseCurricularRepository {
  constructor(private readonly drizzleUow: DrizzleService) {}

  async obterPorId(id: number): Promise<BaseCurricular | null> {
    const model = await this.drizzleUow
      .getTransaction()
      .select()
      .from(baseCurricularTable)
      .innerJoin(
        disciplinaTable,
        eq(baseCurricularTable.id, disciplinaTable.baseId)
      )
      .where(eq(baseCurricularTable.id, id));

    if (model.length === 0) return null;

    return new BaseCurricular({
      id: model[0]!.base_class.id,
      codigo: model[0]!.base_class.code,
      dataCriacao: model[0]!.base_class.creationDate,
      etapaId: model[0]!.base_class.stepId,
      escolaId: model[0]!.base_class.schoolId,
      disciplinas: model.map(
        (m) =>
          new Disciplina({
            id: m.discipline.id,
            nome: m.discipline.name,
            codigo: "",
            cargaHorariaAnual: m.discipline.annual_workload,
          })
      ),
    });
  }

  async existe(id: number): Promise<boolean> {
    const [res] = await this.drizzleUow
      .getTransaction()
      .select({ count: count() })
      .from(baseCurricularTable)
      .where(eq(baseCurricularTable.id, id));

    return !res || res.count > 0;
  }

  async criarBaseCurricular(request: {
    readonly escolaId: number;
    readonly etapaId: number;
    readonly codigo: string;
    readonly disciplinas: Omit<Disciplina, "id" | "baseId">[];
  }): Promise<BaseCurricular> {
    const [baseModel] = await this.drizzleUow
      .getTransaction()
      .insert(baseCurricularTable)
      .values({
        code: request.codigo,
        stepId: request.etapaId,
        schoolId: request.escolaId,
      })
      .returning();

    const disciplinas = await this.drizzleUow
      .getTransaction()
      .insert(disciplinaTable)
      .values(
        request.disciplinas.map<PgInsertValue<typeof disciplinaTable>>((d) => ({
          baseId: baseModel!.id,
          name: d.nome,
          annual_workload: d.cargaHorariaAnual,
        }))
      )
      .returning();

    return new BaseCurricular({
      id: baseModel!.id,
      codigo: baseModel!.code,
      dataCriacao: baseModel!.creationDate,
      etapaId: baseModel!.stepId,
      escolaId: baseModel!.schoolId,
      disciplinas: disciplinas.map(
        (d) =>
          new Disciplina({
            id: d.id,
            nome: d.name,
            codigo: "",
            cargaHorariaAnual: d.annual_workload,
          })
      ),
    });
  }

  async salvarBaseCurricular(base: BaseCurricular): Promise<void> {
    await this.drizzleUow.getTransaction().transaction(async (tx) => {
      for (const disciplina of base.disciplinas) {
        if (!disciplina.getId()) {
          const [id] = await tx
            .insert(disciplinaTable)
            .values({
              name: disciplina.nome,
              annual_workload: disciplina.cargaHorariaAnual,
              baseId: base.id,
            })
            .returning({
              id: disciplinaTable.id,
            });

          disciplina.setId(id!.id);
        } else {
          await tx
            .update(disciplinaTable)
            .set({
              name: disciplinaTable.name,
              annual_workload: disciplina.cargaHorariaAnual,
            })
            .where(eq(disciplinaTable.id, disciplina.getId()!));
        }
      }
    });
  }
}
