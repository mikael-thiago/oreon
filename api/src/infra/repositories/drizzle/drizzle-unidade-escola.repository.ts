import { count, eq } from "drizzle-orm";
import type { UnidadeEscolarRepository } from "../../../domain/repositories/unidade-escola.repository.js";
import type { DrizzleService } from "./drizzle.service.js";
import { unidadeTable } from "./schema.js";

export class DrizzleUnidadeEscolaRepository implements UnidadeEscolarRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async existeComId(id: number): Promise<boolean> {
    const [res] = await this.drizzle
      .getTransaction()
      .select({ count: count() })
      .from(unidadeTable)
      .where(eq(unidadeTable.id, id));

    return !res || res.count > 0;
  }
}
