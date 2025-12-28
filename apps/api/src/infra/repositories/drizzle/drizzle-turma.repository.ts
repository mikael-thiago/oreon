import { and, count, eq } from "drizzle-orm";
import { Turma } from "../../../domain/entities/turma.entity.js";
import type { TurmaRepository } from "../../../domain/repositories/turma.repository.js";
import type { DrizzleService } from "./drizzle.service.js";
import { baseCurricularTable, etapaTable, modalidadeTable, turmaTable } from "./schema.js";

export class DrizzleTurmaRepository implements TurmaRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async obterPorId(id: number): Promise<Turma | null> {
    const [turma] = await this.drizzle
      .getTransaction()
      .select({
        id: turmaTable.id,
        letra: turmaTable.letter,
        anoLetivoId: turmaTable.schoolPeriodId,
        baseId: turmaTable.baseClassId,
        etapaId: turmaTable.etapaId,
        modalidadeId: turmaTable.modalityId,
        limiteDeAlunos: turmaTable.studentsLimit,
      })
      .from(turmaTable)
      .where(eq(turmaTable.id, id));

    if (!turma) {
      return null;
    }

    return new Turma({
      id: turma.id,
      letra: turma.letra,
      anoLetivoId: turma.anoLetivoId,
      baseId: turma.baseId,
      etapaId: turma.etapaId,
      modalidadeId: turma.modalidadeId,
      limiteDeAlunos: turma.limiteDeAlunos,
    });
  }

  async criarTurma(request: {
    readonly anoLetivoId: number;
    readonly baseId: number;
    readonly letra: string;
    readonly unidadeId: number;
  }): Promise<Turma> {
    const [base] = await this.drizzle
      .getTransaction()
      .select({
        baseId: baseCurricularTable.id,
        etapaId: etapaTable.id,
        modalidadeId: modalidadeTable.id,
      })
      .from(baseCurricularTable)
      .innerJoin(etapaTable, eq(etapaTable.id, baseCurricularTable.stepId))
      .innerJoin(modalidadeTable, eq(etapaTable.modalityId, modalidadeTable.id))
      .where(eq(baseCurricularTable.id, request.baseId));

    if (!base) throw new Error(`Base curricular com id ${request.baseId} não encontrada!`);

    const [turmaModel] = await this.drizzle
      .getTransaction()
      .insert(turmaTable)
      .values({
        schoolPeriodId: request.anoLetivoId,
        letter: request.letra,
        unitId: request.unidadeId,
        baseClassId: base.baseId,
        etapaId: base.etapaId,
        modalityId: base.modalidadeId,
        shift: "day",
      })
      .returning({
        id: turmaTable.id,
        letra: turmaTable.letter,
        anoLetivoId: turmaTable.schoolPeriodId,
        baseId: turmaTable.baseClassId,
        etapaId: turmaTable.etapaId,
        modalityId: turmaTable.modalityId,
        limiteDeAlunos: turmaTable.studentsLimit,
      });

    return new Turma({
      id: turmaModel!.id,
      letra: turmaModel!.letra,
      anoLetivoId: turmaModel!.anoLetivoId,
      baseId: turmaModel!.baseId,
      etapaId: turmaModel!.etapaId,
      modalidadeId: turmaModel!.modalityId,
      limiteDeAlunos: turmaModel!.limiteDeAlunos,
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
          eq(turmaTable.etapaId, request.etapaId),
          eq(turmaTable.unitId, request.unidadeId)
        )
      );

    return !res || res.count > 0;
  }
}
