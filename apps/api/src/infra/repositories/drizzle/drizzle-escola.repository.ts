import { count, eq, sql } from "drizzle-orm";
import { Escola } from "../../../domain/entities/escola.entity.js";
import type { EscolaRepository } from "../../../domain/repositories/escola.repository.js";
import type { DrizzleService } from "./drizzle.service.js";
import { escolaTable, unidadeTable } from "./schema.js";

export class DrizzleEscolaRepository implements EscolaRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async obterProximoId(): Promise<number> {
    const res = await this.drizzle
      .getTransaction()
      .execute<{ readonly id: number }>(sql`SELECT NEXTVAL('institutions_id_seq') AS "id"`);

    return res.rows[0]!.id;
  }

  async existeComEmail(email: string): Promise<boolean> {
    const [res] = await this.drizzle
      .getTransaction()
      .select({ count: count() })
      .from(escolaTable)
      .where(eq(escolaTable.email, email));

    return !res || res.count > 0;
  }

  async existe(id: number): Promise<boolean> {
    const [res] = await this.drizzle
      .getTransaction()
      .select({ count: count() })
      .from(escolaTable)
      .where(eq(escolaTable.id, id));

    return !res || res.count > 0;
  }

  async salvar(escola: Escola): Promise<Escola> {
    const [escolaModel] = await this.drizzle
      .getTransaction()
      .insert(escolaTable)
      .values({
        id: escola.id,
        name: escola.nome,
        email: escola.email,
      })
      .returning({ id: escolaTable.id });

    if (!escolaModel) {
      throw new Error("Falha ao criar escola");
    }

    const [unidadeModel] = await this.drizzle
      .getTransaction()
      .insert(unidadeTable)
      .values({
        cnpj: escola.matriz.cnpj,
        phone1: escola.matriz.telefone1,
        phone2: escola.matriz.telefone2,
        street: escola.matriz.endereco.rua,
        number: escola.matriz.endereco.numero,
        city: escola.matriz.endereco.cidade,
        state: escola.matriz.endereco.estado,
        zipCode: escola.matriz.endereco.cep,
        country: escola.matriz.endereco.pais,
        institutionId: escolaModel.id,
        isHeadQuarter: true,
      })
      .returning({ id: unidadeTable.id });

    if (!unidadeModel) {
      throw new Error("Falha ao criar unidade matriz");
    }

    return escola;
  }
}
