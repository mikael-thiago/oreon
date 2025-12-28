import { and, eq, or } from "drizzle-orm";
import type { ListarUnidadesResponse, UnidadeEscolarQueries } from "../../application/queries/unidade-escolar.queries.js";
import type { DrizzleService } from "../repositories/drizzle/drizzle.service.js";
import {
  contratosTable,
  colaboradoresTable,
  escolaTable,
  unidadeTable,
  usuarioTable,
} from "../repositories/drizzle/schema.js";

export class DrizzleUnidadeEscolarQueries implements UnidadeEscolarQueries {
  constructor(private readonly db: DrizzleService) {}

  async listarUnidades(usuarioId: number): Promise<ListarUnidadesResponse[]> {
    const unidades = await this.db
      .getTransaction()
      .select({
        id: unidadeTable.id,
        nome: escolaTable.name,
        cnpj: unidadeTable.cnpj,
        telefone1: unidadeTable.phone1,
        telefone2: unidadeTable.phone2,
        cidade: unidadeTable.city,
        estado: unidadeTable.state,
        isMatriz: unidadeTable.isHeadQuarter,
      })
      .from(unidadeTable)
      .innerJoin(escolaTable, eq(unidadeTable.institutionId, escolaTable.id))
      .innerJoin(usuarioTable, eq(usuarioTable.escolaId, escolaTable.id))
      .leftJoin(colaboradoresTable, eq(colaboradoresTable.userId, usuarioTable.id))
      .leftJoin(
        contratosTable,
        and(eq(contratosTable.employeeId, colaboradoresTable.id), eq(contratosTable.status, "active"))
      )
      .where(
        and(
          eq(usuarioTable.id, usuarioId),
          or(
            and(eq(usuarioTable.isRoot, true), eq(unidadeTable.institutionId, usuarioTable.escolaId)),
            and(eq(contratosTable.unitId, unidadeTable.id))
          )
        )
      );

    return unidades;
  }
}
