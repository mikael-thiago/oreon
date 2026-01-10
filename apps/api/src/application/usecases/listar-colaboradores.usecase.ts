import { UnauthorizedError } from "../../domain/errors/unauthorized.error.js";
import type { UsuarioRepository } from "../../domain/repositories/usuario.repository.js";
import type { ColaboradorListItem, ColaboradoresQueries } from "../queries/colaboradores.queries.js";
import type { UsuarioAutenticado } from "../types/authenticated-user.type.js";
import { Result } from "../../domain/shared/result.js";

export type ListarColaboradoresRequest = {
  readonly usuarioAutenticado: UsuarioAutenticado;
  readonly unidadeId?: number | undefined;
};

export class ListarColaboradoresUseCase {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly colaboradoresQueries: ColaboradoresQueries
  ) {}

  async executar({
    usuarioAutenticado,
    unidadeId,
  }: ListarColaboradoresRequest): Promise<Result<ColaboradorListItem[], UnauthorizedError>> {
    const usuario = await this.usuarioRepository.obterUsuarioPorId(usuarioAutenticado.id);

    if (!usuario) {
      return Result.fail(new UnauthorizedError(`Usuário com ID ${usuarioAutenticado.id} não encontrado`));
    }

    if (!usuario.root) {
      return Result.fail(new UnauthorizedError("Somente o usuário raiz da escola podem listar colaboradores"));
    }

    const colaboradores = await this.colaboradoresQueries.listarColaboradores(usuarioAutenticado.escolaId, unidadeId);

    return Result.ok(colaboradores);
  }
}
