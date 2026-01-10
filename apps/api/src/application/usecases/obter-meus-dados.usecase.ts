import type { UsuarioRepository } from "../../domain/repositories/usuario.repository.js";
import type { UsuarioAutenticado } from "../types/authenticated-user.type.js";
import { Result } from "../../domain/shared/result.js";

export type ObterMeusDadosRequest = UsuarioAutenticado;

export type ObterMeusDadosResponse = {
  readonly id: number;
  readonly nome: string;
  readonly email: string;
  readonly escolaId: number;
} | null;

export class ObterMeusDadosUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async executar(request: ObterMeusDadosRequest): Promise<Result<ObterMeusDadosResponse, never>> {
    const usuario = await this.usuarioRepository.obterUsuarioPorId(request.id);

    if (usuario === null) {
      return Result.ok(null);
    }

    return Result.ok({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.login,
      escolaId: usuario.escolaId,
    });
  }
}
