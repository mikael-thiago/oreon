import { count, eq } from "drizzle-orm";
import type { UnidadeEscolarRepository } from "../../../domain/repositories/UnidadeEscolaRepository.js";
import type { DrizzleService } from "./DrizzleService.js";
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
