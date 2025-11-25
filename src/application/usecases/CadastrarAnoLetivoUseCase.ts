import { ConflictError } from "../../domain/errors/ConflictError.js";
import { AnoLetivoRepository } from "../../domain/repositories/AnoLetivoRepository.js";

export type CadastrarAnoLetivoRequest = {
  readonly anoReferencia: number;
  readonly dataInicio: Date;
  readonly dataFim: Date;
  readonly escolaId: number;
};

export class CadastrarAnoLetivoUseCase {
  private readonly anoLetivoRepository: AnoLetivoRepository;

  constructor(anoLetivoRepository: AnoLetivoRepository) {
    this.anoLetivoRepository = anoLetivoRepository;
  }

  async executar(request: CadastrarAnoLetivoRequest) {
    const anoLetivoAnoConflitante =
      await this.anoLetivoRepository.obterAnoLetivoPorAno(
        request.escolaId,
        request.anoReferencia
      );

    if (anoLetivoAnoConflitante) {
      throw new ConflictError("Ano letivo com mesmo ano já existe!");
    }

    const anoLetivoComDataConflitante =
      await this.anoLetivoRepository.obterAnoLetivoPorData(
        request.escolaId,
        request.dataInicio,
        request.dataFim
      );

    if (anoLetivoComDataConflitante) {
      throw new ConflictError(
        "Ano letivo que contempla as datas informadas já existe!"
      );
    }

    return this.anoLetivoRepository.criarAnoLetivo(request);
  }
}
