import { ForbiddenError } from "../../domain/errors/forbidden.error.js";
import { NotFoundError } from "../../domain/errors/not-found.error.js";
import type { UnidadeEscolarRepository } from "../../domain/repositories/unidade-escola.repository.js";
import type { ListarSolicitacoesResponse, MatriculasQueries } from "../queries/matriculas.queries.js";
import type { UsuarioAutenticado } from "../types/authenticated-user.type.js";
import { Result } from "../../domain/shared/result.js";

export type ListarSolicitacoesUseCaseRequest = {
  readonly usuarioAutenticado: UsuarioAutenticado;
  readonly unidadeId: number;
  readonly periodoLetivoId: number;
  readonly modalidadeId: number;
};

export class ListarSolicitacoesUseCase {
  constructor(
    private readonly unidadeEscolarRepository: UnidadeEscolarRepository,
    private readonly matriculasQueries: MatriculasQueries
  ) {}

  async executar(
    request: ListarSolicitacoesUseCaseRequest
  ): Promise<Result<ListarSolicitacoesResponse[], NotFoundError | ForbiddenError>> {
    const unidade = await this.unidadeEscolarRepository.obterUnidadePorId(request.unidadeId);

    if (!unidade) {
      return Result.fail(new NotFoundError(`Unidade com ID ${request.unidadeId} não encontrada`));
    }

    // TODO: Ajustar isso após adicionar verificação de unidade por usuário
    if (unidade.escolaId !== request.usuarioAutenticado.escolaId) {
      return Result.fail(new ForbiddenError("Você não tem permissão para acessar solicitações desta unidade"));
    }

    const solicitacoes = await this.matriculasQueries.listarSolicitacoes({
      unidadeId: request.unidadeId,
      periodoLetivoId: request.periodoLetivoId,
      modalidadeId: request.modalidadeId,
    });

    return Result.ok(solicitacoes);
  }
}
