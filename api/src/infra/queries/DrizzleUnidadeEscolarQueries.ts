import { eq } from "drizzle-orm";
import type { ListarUnidadesResponse, UnidadeEscolarQueries } from "../../application/queries/UnidadeEscolarQueries.js";
import type { DrizzleService } from "../repositories/drizzle/DrizzleService.js";
import { escolaTable, unidadeTable } from "../repositories/drizzle/schema.js";

export class DrizzleUnidadeEscolarQueries implements UnidadeEscolarQueries {
  constructor(private readonly db: DrizzleService) {}

  async listarUnidades(escolaId: number): Promise<ListarUnidadesResponse[]> {
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
      .where(eq(unidadeTable.institutionId, escolaId));

    return unidades;
  }
}
