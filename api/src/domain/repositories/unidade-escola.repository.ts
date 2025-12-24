import type { UnidadeEscolar } from "../entities/unidade-escolar.entity.js";

export abstract class UnidadeEscolarRepository {
  abstract existeComId(id: number): Promise<boolean>;
}
