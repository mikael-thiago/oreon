import type { CargoListItem, CargoQueries } from "../../application/queries/CargoQueries.js";
import type { DrizzleService } from "../repositories/drizzle/DrizzleService.js";
import { cargosTable } from "../repositories/drizzle/schema.js";

export class DrizzleCargoQueries implements CargoQueries {
  constructor(private readonly drizzle: DrizzleService) {}

  async listarCargos(): Promise<CargoListItem[]> {
    const results = await this.drizzle.getTransaction().select({
      id: cargosTable.id,
      nome: cargosTable.name,
      podeEnsinar: cargosTable.canTeach,
    }).from(cargosTable);

    return results.map((result) => ({
      id: result.id,
      nome: result.nome,
      podeEnsinar: result.podeEnsinar || false,
    }));
  }
}
