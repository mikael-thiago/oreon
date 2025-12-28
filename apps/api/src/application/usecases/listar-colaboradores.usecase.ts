import { UnauthorizedError } from "../../domain/errors/unauthorized.error.js";
import type { UsuarioRepository } from "../../domain/repositories/usuario.repository.js";
import type { ColaboradorListItem, ColaboradoresQueries } from "../queries/colaboradores.queries.js";
import type { UsuarioAutenticado } from "../types/authenticated-user.type.js";

export type ListarColaboradoresRequest = {
  readonly usuarioAutenticado: UsuarioAutenticado;
  readonly unidadeId?: number | undefined;
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
