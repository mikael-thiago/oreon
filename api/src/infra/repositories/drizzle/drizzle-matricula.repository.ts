import { and, eq } from "drizzle-orm";
import { Matricula } from "../../../domain/entities/matricula.entity.js";
import type {
  CriarMatriculaRequest,
  MatriculaRepository,
} from "../../../domain/repositories/matricula.repository.js";
import type { StatusMatricula } from "../../../domain/enums/status-matricula.enum.js";
import { DateFormatter } from "../../utils/date-formatter.js";
import type { DrizzleService } from "./drizzle.service.js";
import { matriculasTable } from "./schema.js";

export class DrizzleMatriculaRepository implements MatriculaRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async criarMatricula(request: CriarMatriculaRequest): Promise<Matricula> {
    const [matriculaModel] = await this.drizzle
      .getTransaction()
      .insert(matriculasTable)
      .values({
        unitId: request.unidadeId,
        studentId: request.estudanteId,
        schoolPeriodId: request.periodoLetivoId,
        status: request.status,
        createdDate: DateFormatter.format(request.dataCriacao, "YYYY-MM-DD"),
        proofOfResidenceId: request.comprovanteResidenciaId,
        scholarHistoryId: request.historicoEscolarId,
      })
      .returning();

    if (!matriculaModel) {
      throw new Error("Falha ao criar matrícula");
    }

    return new Matricula({
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

    return new Matricula({
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
}
