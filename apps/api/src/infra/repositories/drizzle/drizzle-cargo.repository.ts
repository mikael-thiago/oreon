import { eq } from "drizzle-orm";
import { Cargo } from "../../../domain/entities/cargo.entity.js";
import type { CargoRepository } from "../../../domain/repositories/cargo.repository.js";
import type { DrizzleService } from "./drizzle.service.js";
import { cargosTable } from "./schema.js";

export class DrizzleCargoRepository implements CargoRepository {
  constructor(private readonly drizzleDb: DrizzleService) {}

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
