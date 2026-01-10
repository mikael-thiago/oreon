import type { UnidadeEscolar } from "../entities/unidade-escolar.entity.js";

export abstract class UnidadeEscolarRepository {
  abstract obterProximoId(): Promise<number>;
  abstract existeComId(id: number): Promise<boolean>;
  abstract obterUnidadePorId(id: number): Promise<UnidadeEscolar | null>;
}
