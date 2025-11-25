import { IllegalArgumentError } from "../../domain/errors/IllegalArgumentError.js";
import type { BaseCurricularRepository } from "../../domain/repositories/BaseCurricularRepository.js";
import type { EscolaRepository } from "../../domain/repositories/EscolaRepository.js";

export type CadastrarBaseCurricularRequest = {
  readonly usuario: { readonly id: number; readonly escolaId: number };
  readonly etapaId: number;
  readonly disciplinas: {
    readonly nome: string;
    readonly codigo: string;
    readonly cargaHorariaAnual: number;
  }[];
};

export class CadastrarBaseUseCase {
  constructor(
    private readonly escolaRepository: EscolaRepository,
    private readonly baseRepository: BaseCurricularRepository
  ) {}

  async executar(request: CadastrarBaseCurricularRequest) {
    const escolaExiste = await this.escolaRepository.existe(request.usuario.escolaId);

    if (!escolaExiste) {
      throw new IllegalArgumentError(`Escola com ID ${request.usuario.escolaId} não existe!`);
    }

    return this.baseRepository.criarBaseCurricular({
      codigo: `BASE${request.etapaId}${parseInt(String(Math.random() * 1_000))}`,
      etapaId: request.etapaId,
      disciplinas: request.disciplinas,
      escolaId: request.usuario.escolaId,
    });
  }
}
