import { ForbiddenError } from "../../domain/errors/forbidden.error.js";
import { NotFoundError } from "../../domain/errors/not-found.error.js";
import type { UnidadeEscolarRepository } from "../../domain/repositories/unidade-escola.repository.js";
import type { MatriculasQueries, ResumoSolicitacoesResponse } from "../queries/matriculas.queries.js";
import type { UsuarioAutenticado } from "../types/authenticated-user.type.js";
import { Result } from "../../domain/shared/result.js";

export type ListarResumoSolicitacoesUseCaseRequest = {
  readonly usuarioAutenticado: UsuarioAutenticado;
  readonly unidadeId: number;
  readonly periodoLetivoId: number;
};

export class ListarResumoSolicitacoesUseCase {
  constructor(
    private readonly unidadeEscolarRepository: UnidadeEscolarRepository,
    private readonly matriculasQueries: MatriculasQueries
  ) {}

  async executar(
    request: ListarResumoSolicitacoesUseCaseRequest
  ): Promise<Result<ResumoSolicitacoesResponse, NotFoundError | ForbiddenError>> {
    const unidade = await this.unidadeEscolarRepository.obterUnidadePorId(request.unidadeId);

    if (!unidade) {
      return Result.fail(new NotFoundError(`Unidade com ID ${request.unidadeId} não encontrada`));
    }

    // Validar que o usuário tem acesso à escola da unidade
    if (unidade.escolaId !== request.usuarioAutenticado.escolaId) {
      return Result.fail(
        new ForbiddenError("Você não tem permissão para acessar o resumo de solicitações desta unidade")
      );
    }

    const resumo = await this.matriculasQueries.obterResumoSolicitacoesPorUnidadeEAnoLetivo(
      request.unidadeId,
      request.periodoLetivoId
    );

    return Result.ok(resumo);
  }
}
