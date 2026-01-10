import { count, eq, sql } from "drizzle-orm";
import type { UnidadeEscolarRepository } from "../../../domain/repositories/unidade-escola.repository.js";
import type { DrizzleService } from "./drizzle.service.js";
import { escolaTable, unidadeTable } from "./schema.js";
import { UnidadeEscolar } from "../../../domain/entities/unidade-escolar.entity.js";

export class DrizzleUnidadeEscolaRepository implements UnidadeEscolarRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async obterProximoId(): Promise<number> {
    const res = await this.drizzle
      .getTransaction()
      .execute<{ readonly id: number }>(sql`SELECT NEXTVAL('institution_unit_id_seq') AS "id"`);

    return res.rows[0]!.id;
  }

  async existeComId(id: number): Promise<boolean> {
    const [res] = await this.drizzle
      .getTransaction()
      .select({ count: count() })
      .from(unidadeTable)
      .where(eq(unidadeTable.id, id));

    return !res || res.count > 0;
  }

  async obterUnidadePorId(id: number): Promise<UnidadeEscolar | null> {
    const [result] = await this.drizzle
      .getTransaction()
      .select({
        id: unidadeTable.id,
        nome: escolaTable.name,
        email: escolaTable.email,
        cnpj: unidadeTable.cnpj,
        telefone1: unidadeTable.phone1,
        telefone2: unidadeTable.phone2,
        escolaId: unidadeTable.institutionId,
        cidade: unidadeTable.city,
        estado: unidadeTable.state,
        cep: unidadeTable.zipCode,
        logradouro: unidadeTable.street,
        numero: unidadeTable.number,
        pais: unidadeTable.country,
        dataDeCriacao: unidadeTable.createdAt,
      })
      .from(unidadeTable)
      .innerJoin(escolaTable, eq(unidadeTable.institutionId, escolaTable.id))
      .where(eq(unidadeTable.id, id));

    if (!result) {
      return null;
    }

    return new UnidadeEscolar({
      id: result.id,
      nome: result.nome,
      email: result.email,
      cnpj: result.cnpj,
      telefone1: result.telefone1,
      telefone2: result.telefone2 ?? undefined,
      escolaId: result.escolaId,
      endereco: {
        cidade: result.cidade ?? undefined,
        estado: result.estado ?? undefined,
        cep: result.cep ?? undefined,
        rua: result.logradouro ?? undefined,
        numero: result.numero ?? undefined,
        pais: result.pais ?? undefined,
      },
      dataDeCriacao: result.dataDeCriacao,
    });
  }
}
