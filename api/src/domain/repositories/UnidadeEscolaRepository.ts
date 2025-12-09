import type { UnidadeEscolar } from "../entities/UnidadeEscolar.js";

export abstract class UnidadeEscolarRepository {
  abstract existeComId(id: number): Promise<boolean>;
}
