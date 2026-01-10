import { eq, sql } from "drizzle-orm";
import { Cargo } from "../../../domain/entities/cargo.entity.js";
import type { CargoRepository } from "../../../domain/repositories/cargo.repository.js";
import type { DrizzleService } from "./drizzle.service.js";
import { cargosTable } from "./schema.js";

export class DrizzleCargoRepository implements CargoRepository {
  constructor(private readonly drizzleDb: DrizzleService) {}

  async obterProximoId(): Promise<number> {
    const res = await this.drizzleDb
      .getTransaction()
      .execute<{ readonly id: number }>(sql`SELECT NEXTVAL('occupations_id_seq') AS "id"`);

    return res.rows[0]!.id;
  }

  async obterCargoPorId(id: number): Promise<Cargo | null> {
    const [cargoModel] = await this.drizzleDb
      .getTransaction()
      .select()
      .from(cargosTable)
      .where(eq(cargosTable.id, id));

    if (!cargoModel) {
      return null;
    }

    return new Cargo({
      id: cargoModel.id,
      nome: cargoModel.name,
      podeEnsinar: cargoModel.canTeach || false,
    });
  }
}
