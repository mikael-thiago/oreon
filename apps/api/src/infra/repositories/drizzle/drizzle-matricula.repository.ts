import { and, eq, sql } from "drizzle-orm";
import { Matricula } from "../../../domain/entities/matricula.entity.js";
import type { MatriculaRepository } from "../../../domain/repositories/matricula.repository.js";
import type { StatusMatricula } from "../../../domain/enums/status-matricula.enum.js";
import { DateFormatter } from "@oreon/utils/date-formatter";
import type { DrizzleService } from "./drizzle.service.js";
import { matriculasTable } from "./schema.js";
import { DateFormatEnum } from "@oreon/utils/date-format";

export class DrizzleMatriculaRepository implements MatriculaRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async obterProximoId(): Promise<number> {
    const res = await this.drizzle
      .getTransaction()
      .execute<{ readonly id: number }>(sql`SELECT NEXTVAL('matriculations_id_seq') AS "id"`);

    return res.rows[0]!.id;
  }

  async obterMatriculaPorEstudanteEPeriodoLetivo(
    estudanteId: number,
    periodoLetivoId: number
  ): Promise<Matricula | null> {
    const [matriculaModel] = await this.drizzle
      .getTransaction()
      .select()
      .from(matriculasTable)
      .where(
        and(
          eq(matriculasTable.studentId, estudanteId),
          eq(matriculasTable.schoolPeriodId, periodoLetivoId)
        )
      );

    if (!matriculaModel) {
      return null;
    }

    return Matricula.reconstituir({
      id: matriculaModel.id,
      unidadeId: matriculaModel.unitId,
      estudanteId: matriculaModel.studentId,
      periodoLetivoId: matriculaModel.schoolPeriodId,
      status: matriculaModel.status as StatusMatricula,
      dataCriacao: new Date(matriculaModel.createdDate),
      comprovanteResidenciaId: matriculaModel.proofOfResidenceId,
      historicoEscolarId: matriculaModel.scholarHistoryId,
    });
  }

  async salvar(matricula: Matricula): Promise<Matricula> {
    const [matriculaModel] = await this.drizzle
      .getTransaction()
      .insert(matriculasTable)
      .values({
        id: matricula.id,
        unitId: matricula.unidadeId,
        studentId: matricula.estudanteId,
        schoolPeriodId: matricula.periodoLetivoId,
        status: matricula.status,
        createdDate: DateFormatter.format(matricula.dataCriacao, DateFormatEnum.ISO_DATE),
        proofOfResidenceId: matricula.comprovanteResidenciaId,
        scholarHistoryId: matricula.historicoEscolarId,
      })
      .returning({ id: matriculasTable.id });

    if (!matriculaModel) {
      throw new Error("Falha ao criar matrícula");
    }

    return matricula;
  }
}
