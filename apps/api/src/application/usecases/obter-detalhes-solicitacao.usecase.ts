import { ForbiddenError } from "../../domain/errors/forbidden.error.js";
import { NotFoundError } from "../../domain/errors/not-found.error.js";
import type { SolicitacaoMatriculaRepository } from "../../domain/repositories/solicitacao-matricula.repository.js";
import type { UnidadeEscolarRepository } from "../../domain/repositories/unidade-escola.repository.js";
import type { MatriculasQueries, ObterDetalhesSolicitacaoResponse } from "../queries/matriculas.queries.js";
import type { UsuarioAutenticado } from "../types/authenticated-user.type.js";

export type ObterDetalhesSolicitacaoUseCaseRequest = {
  readonly usuarioAutenticado: UsuarioAutenticado;
  readonly solicitacaoId: number;
};

export class ObterDetalhesSolicitacaoUseCase {
  constructor(
    private readonly solicitacaoMatriculaRepository: SolicitacaoMatriculaRepository,
    private readonly unidadeEscolarRepository: UnidadeEscolarRepository,
    private readonly matriculasQueries: MatriculasQueries
  ) {}

  async executar(request: ObterDetalhesSolicitacaoUseCaseRequest): Promise<ObterDetalhesSolicitacaoResponse | null> {
    const solicitacao = await this.solicitacaoMatriculaRepository.obterSolicitacaoMatriculaPorId(
      request.solicitacaoId
    );

    if (!solicitacao) {
      return null;
    }

    const unidade = await this.unidadeEscolarRepository.obterUnidadePorId(solicitacao.unidadeId);

    if (!unidade) {
      throw new NotFoundError(`Unidade com ID ${solicitacao.unidadeId} não encontrada`);
    }

    if (unidade.escolaId !== request.usuarioAutenticado.escolaId) {
      throw new ForbiddenError("Você não tem permissão para acessar os detalhes desta solicitação");
    }

    const detalhes = await this.matriculasQueries.obterDetalhesSolicitacao(request.solicitacaoId);

    if (!detalhes) {
      throw new NotFoundError(`Solicitação de matrícula com ID ${request.solicitacaoId} não encontrada`);
    }

    return detalhes;
  }
}
