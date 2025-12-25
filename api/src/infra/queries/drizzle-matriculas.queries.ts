import { and, eq } from "drizzle-orm";
import type {
  ListarMatriculasRequest,
  ListarMatriculasResponse,
  MatriculasQueries,
} from "../../application/queries/matriculas.queries.js";
import type { DrizzleService } from "../repositories/drizzle/drizzle.service.js";
import { estudantesTable, matriculasTable } from "../repositories/drizzle/schema.js";

export class DrizzleMatriculasQueries implements MatriculasQueries {
  constructor(private readonly db: DrizzleService) {}

  async listarMatriculas(request: ListarMatriculasRequest): Promise<ListarMatriculasResponse[]> {
    const matriculas = await this.db
      .getTransaction()
      .select({
        id: matriculasTable.id,
        estudante: {
          id: estudantesTable.id,
          nome: estudantesTable.name,
          cpf: estudantesTable.cpf,
          dataDeNascimento: estudantesTable.birthDate,
        },
        status: matriculasTable.status,
        dataCriacao: matriculasTable.createdDate,
        comprovanteResidenciaId: matriculasTable.proofOfResidenceId,
        historicoEscolarId: matriculasTable.scholarHistoryId,
      })
      .from(matriculasTable)
      .innerJoin(estudantesTable, eq(matriculasTable.studentId, estudantesTable.id))
      .where(
        and(
          eq(matriculasTable.unitId, request.unidadeId),
          eq(matriculasTable.schoolPeriodId, request.periodoLetivoId)
        )
      )
      .orderBy(matriculasTable.createdDate);

    return matriculas;
  }
}
