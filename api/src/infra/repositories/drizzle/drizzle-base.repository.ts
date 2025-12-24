import { and, count, eq } from "drizzle-orm";
import type { PgInsertValue } from "drizzle-orm/pg-core";
import { BaseCurricular, type DisciplinaDaBase } from "../../../domain/entities/base-curricular.entity.js";
import type { BaseCurricularRepository } from "../../../domain/repositories/base-curricular.repository.js";
import type { DrizzleService } from "./drizzle.service.js";
import { baseCurricularTable, baseDisciplinaTable, disciplinasTable } from "./schema.js";

export class DrizzleBaseRepository implements BaseCurricularRepository {
  constructor(private readonly drizzleUow: DrizzleService) {}

  async verificarExistenciaDeCodigoDeDisciplinaNaUnidade(codigo: string, unidadeId: number): Promise<boolean> {
    const [result] = await this.drizzleUow
      .getTransaction()
      .select({ count: count() })
      .from(baseDisciplinaTable)
      .innerJoin(
        baseCurricularTable,
        and(eq(baseDisciplinaTable.baseId, baseCurricularTable.id), eq(baseCurricularTable.unitId, unidadeId))
      )
      .where(eq(baseDisciplinaTable.code, codigo));

    if (!result) return false;

    return result.count > 0;
  }

  async obterSequencialPorEtapaEUnidade(request: {
    readonly etapaId: number;
    readonly unidadeId: number;
  }): Promise<number> {
    const [result_1] = await this.drizzleUow
      .getTransaction()
      .select({ count: count() })
      .from(baseCurricularTable)
      .where(and(eq(baseCurricularTable.stepId, request.etapaId), eq(baseCurricularTable.unitId, request.unidadeId)));

    return (result_1?.count ?? 0) + 1;
  }

  async obterPorId(id: number): Promise<BaseCurricular | null> {
    const model = await this.drizzleUow
      .getTransaction()
      .select()
      .from(baseCurricularTable)
      .innerJoin(baseDisciplinaTable, eq(baseCurricularTable.id, baseDisciplinaTable.baseId))
      .innerJoin(disciplinasTable, eq(baseDisciplinaTable.disciplineId, disciplinasTable.id))
      .where(eq(baseCurricularTable.id, id));

    if (model.length === 0) return null;

    return new BaseCurricular({
      id: model[0]!.base_classes.id,
      codigo: model[0]!.base_classes.code,
      dataCriacao: model[0]!.base_classes.creationDate,
      etapaId: model[0]!.base_classes.stepId,
      unidadeId: model[0]!.base_classes.unitId,
      disciplinas: model.map((m) => ({
        id: m.disciplines.id,
        nome: m.disciplines.name,
        slug: m.disciplines.slug,
        codigo: m.base_class_discipline.code,
        cargaHorariaAnual: m.base_class_discipline.annual_workload,
      })),
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
    readonly unidadeId: number;
    readonly etapaId: number;
    readonly codigo: string;
    readonly disciplinas: DisciplinaDaBase[];
  }): Promise<BaseCurricular> {
    const [baseModel] = await this.drizzleUow
      .getTransaction()
      .insert(baseCurricularTable)
      .values({
        code: request.codigo,
        stepId: request.etapaId,
        unitId: request.unidadeId,
      })
      .returning();

    await this.drizzleUow
      .getTransaction()
      .insert(baseDisciplinaTable)
      .values(
        request.disciplinas.map<PgInsertValue<typeof baseDisciplinaTable>>((d) => ({
          baseId: baseModel!.id,
          disciplineId: d.id,
          code: d.codigo,
          annual_workload: d.cargaHorariaAnual,
        }))
      );

    return new BaseCurricular({
      id: baseModel!.id,
      codigo: baseModel!.code,
      dataCriacao: baseModel!.creationDate,
      etapaId: baseModel!.stepId,
      unidadeId: baseModel!.unitId,
      disciplinas: request.disciplinas,
    });
  }

  async salvarBaseCurricular(base: BaseCurricular): Promise<void> {
    await this.drizzleUow.getTransaction().transaction(async (tx) => {
      for (const disciplina of base.disciplinas) {
        await tx
          .update(baseDisciplinaTable)
          .set({
            code: disciplina.codigo,
            annual_workload: disciplina.cargaHorariaAnual,
          })
          .where(eq(baseDisciplinaTable.baseId, base.id));
      }
    });
  }
}
