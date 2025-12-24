import type { Cargo } from "../entities/cargo.entity.js";

export abstract class CargoRepository {
  abstract obterCargoPorId(id: number): Promise<Cargo | null>;
}
