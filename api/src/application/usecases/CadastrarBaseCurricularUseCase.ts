import { IllegalArgumentError } from "../../domain/errors/IllegalArgumentError.js";
import type { BaseCurricularRepository } from "../../domain/repositories/BaseCurricularRepository.js";
import type { EscolaRepository } from "../../domain/repositories/EscolaRepository.js";
import type { UnidadeEscolarRepository } from "../../domain/repositories/UnidadeEscolaRepository.js";
import type { UsuarioAutenticado } from "../types/AuthenticatedUser.js";

export type CadastrarBaseCurricularRequest = {
  readonly usuario: UsuarioAutenticado;
  readonly etapaId: number;
  readonly unidadeId: number;
  readonly disciplinas: {
    readonly nome: string;
    readonly codigo: string;
    readonly cargaHorariaAnual: number;
  }[];
};

export class CadastrarBaseUseCase {
  constructor(
    private readonly escolaRepository: EscolaRepository,
    private readonly baseRepository: BaseCurricularRepository,
    private readonly unidadeEscolarRepository: UnidadeEscolarRepository
  ) {}

  async executar(request: CadastrarBaseCurricularRequest) {
    const [escolaExiste, unidadeExiste] = await Promise.all([
      this.escolaRepository.existe(request.usuario.escolaId),
      this.unidadeEscolarRepository.existeComId(request.unidadeId),
    ]);

    if (!escolaExiste) throw new IllegalArgumentError(`Escola com ID ${request.usuario.escolaId} não existe!`);
    if (!unidadeExiste) throw new IllegalArgumentError(`Unidade com ID ${request.unidadeId} não existe!`);

    return this.baseRepository.criarBaseCurricular({
      codigo: `BASE${request.etapaId}${parseInt(String(Math.random() * 1_000))}`,
      etapaId: request.etapaId,
      disciplinas: request.disciplinas,
      unidadeId: request.unidadeId,
    });
  }
}
