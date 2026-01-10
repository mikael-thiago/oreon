import { and, count, eq, sql } from "drizzle-orm";
import { Turma } from "../../../domain/entities/turma.entity.js";
import type { TurmaRepository } from "../../../domain/repositories/turma.repository.js";
import type { DrizzleService } from "./drizzle.service.js";
import { turmaTable } from "./schema.js";

export class DrizzleTurmaRepository implements TurmaRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async obterProximoId(): Promise<number> {
    const res = await this.drizzle
      .getTransaction()
      .execute<{ readonly id: number }>(sql`SELECT NEXTVAL('classes_id_seq') AS "id"`);

    return res.rows[0]!.id;
  }

  async obterPorId(id: number): Promise<Turma | null> {
    const [turma] = await this.drizzle
      .getTransaction()
      .select({
        id: turmaTable.id,
        letra: turmaTable.letter,
        anoLetivoId: turmaTable.schoolPeriodId,
        baseId: turmaTable.baseClassId,
        etapaId: turmaTable.stepId,
        modalidadeId: turmaTable.modalityId,
        limiteDeAlunos: turmaTable.studentsLimit,
        unidadeId: turmaTable.unitId,
      })
      .from(turmaTable)
      .where(eq(turmaTable.id, id));

    if (!turma) {
      return null;
    }

    return Turma.reconstituir({
      id: turma.id,
      letra: turma.letra,
      anoLetivoId: turma.anoLetivoId,
      baseId: turma.baseId,
      etapaId: turma.etapaId,
      modalidadeId: turma.modalidadeId,
      limiteDeAlunos: turma.limiteDeAlunos,
      unidadeId: turma.unidadeId,
    });
  }

  async existeTurmaPorEtapaAnoELetra(request: {
    readonly anoLetivoId: number;
    readonly etapaId: number;
    readonly letra: string;
    readonly unidadeId: number;
  }): Promise<boolean> {
    const [res] = await this.drizzle
      .getTransaction()
      .select({ count: count() })
      .from(turmaTable)
      .where(
        and(
          eq(turmaTable.schoolPeriodId, request.anoLetivoId),
          eq(turmaTable.letter, request.letra),
          eq(turmaTable.stepId, request.etapaId),
          eq(turmaTable.unitId, request.unidadeId)
        )
      );

    return !res || res.count > 0;
  }

  async salvar(turma: Turma): Promise<Turma> {
    const [turmaModel] = await this.drizzle
      .getTransaction()
      .insert(turmaTable)
      .values({
        id: turma.id,
        schoolPeriodId: turma.anoLetivoId,
        letter: turma.letra,
        unitId: turma.unidadeId,
        baseClassId: turma.baseId,
        stepId: turma.etapaId,
        modalityId: turma.modalidadeId,
        studentsLimit: turma.limiteDeAlunos,
        shift: "day",
      })
      .returning({ id: turmaTable.id });

    if (!turmaModel) {
      throw new Error("Falha ao criar turma");
    }

    return turma;
  }
}
