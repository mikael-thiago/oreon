import type { UsuarioRepository } from "../../domain/repositories/UsuarioRepository.js";
import type { UsuarioAutenticado } from "../types/AuthenticatedUser.js";

export type ObterMeusDadosRequest = UsuarioAutenticado;

export class ObterMeusDadosUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async executar(request: ObterMeusDadosRequest) {
    const usuario = await this.usuarioRepository.obterUsuarioPorId(request.id);

    if (usuario === null) return null;

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      escolaId: usuario.escolaId,
    };
  }
}
