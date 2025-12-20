import { UnauthorizedError } from "../../domain/errors/UnauthorizedError.js";
import type { UsuarioRepository } from "../../domain/repositories/UsuarioRepository.js";
import type { ColaboradorListItem, ColaboradoresQueries } from "../queries/ColaboradoresQueries.js";
import type { UsuarioAutenticado } from "../types/AuthenticatedUser.js";

export type ListarColaboradoresRequest = {
  readonly usuarioAutenticado: UsuarioAutenticado;
  readonly unidadeId?: number;
};

export class ListarColaboradoresUseCase {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly colaboradoresQueries: ColaboradoresQueries
  ) {}

  async executar({ usuarioAutenticado, unidadeId }: ListarColaboradoresRequest): Promise<ColaboradorListItem[]> {
    const usuario = await this.usuarioRepository.obterUsuarioPorId(usuarioAutenticado.id);

    if (!usuario) {
      throw new UnauthorizedError(`Usuário com ID ${usuarioAutenticado.id} não encontrado`);
    }

    if (!usuario.root) {
      throw new UnauthorizedError("Somente o usuário raiz da escola podem listar colaboradores");
    }

    return this.colaboradoresQueries.listarColaboradores(usuarioAutenticado.escolaId, unidadeId);
  }
}
