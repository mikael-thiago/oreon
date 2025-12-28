import { ForbiddenError } from "../../domain/errors/forbidden.error.js";
import { NotFoundError } from "../../domain/errors/not-found.error.js";
import type { UnidadeEscolarRepository } from "../../domain/repositories/unidade-escola.repository.js";
import type { ListarSolicitacoesResponse, MatriculasQueries } from "../queries/matriculas.queries.js";
import type { UsuarioAutenticado } from "../types/authenticated-user.type.js";

export type ListarSolicitacoesUseCaseRequest = {
  readonly usuarioAutenticado: UsuarioAutenticado;
  readonly unidadeId: number;
  readonly periodoLetivoId: number;
};

export class ListarSolicitacoesUseCase {
  constructor(
    private readonly unidadeEscolarRepository: UnidadeEscolarRepository,
    private readonly matriculasQueries: MatriculasQueries
  ) {}

  async executar(request: ListarSolicitacoesUseCaseRequest): Promise<ListarSolicitacoesResponse[]> {
    const unidade = await this.unidadeEscolarRepository.obterUnidadePorId(request.unidadeId);

    if (!unidade) {
      throw new NotFoundError(`Unidade com ID ${request.unidadeId} não encontrada`);
    }

    // TODO: Ajustar isso após adicionar verificação de unidade por usuário
    if (unidade.escolaId !== request.usuarioAutenticado.escolaId) {
      throw new ForbiddenError("Você não tem permissão para acessar solicitações desta unidade");
    }

    return this.matriculasQueries.listarSolicitacoes({
      unidadeId: request.unidadeId,
      periodoLetivoId: request.periodoLetivoId,
    });
  }
}
