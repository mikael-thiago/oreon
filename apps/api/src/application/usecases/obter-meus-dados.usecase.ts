import type { UsuarioRepository } from "../../domain/repositories/usuario.repository.js";
import type { UsuarioAutenticado } from "../types/authenticated-user.type.js";

export type ObterMeusDadosRequest = UsuarioAutenticado;

export class ObterMeusDadosUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async executar(request: ObterMeusDadosRequest) {
    const usuario = await this.usuarioRepository.obterUsuarioPorId(request.id);

    if (usuario === null) return null;

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.login,
      escolaId: usuario.escolaId,
    };
  }
}
