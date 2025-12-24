import { ConflictError } from "../../domain/errors/conflict.error.js";
import { AnoLetivoRepository } from "../../domain/repositories/ano-letivo.repository.js";
import type { UsuarioAutenticado } from "../types/authenticated-user.type.js";

export type CadastrarAnoLetivoRequest = {
  readonly anoReferencia: number;
  readonly dataInicio: Date;
  readonly dataFim: Date;
  readonly usuario: UsuarioAutenticado;
};

export class CadastrarAnoLetivoUseCase {
  private readonly anoLetivoRepository: AnoLetivoRepository;

  constructor(anoLetivoRepository: AnoLetivoRepository) {
    this.anoLetivoRepository = anoLetivoRepository;
  }

  async executar(request: CadastrarAnoLetivoRequest) {
    const anoLetivoAnoConflitante =
      await this.anoLetivoRepository.obterAnoLetivoPorAno(
        request.usuario.escolaId,
        request.anoReferencia
      );

    if (anoLetivoAnoConflitante) {
      throw new ConflictError("Ano letivo com mesmo ano já existe!");
    }

    const anoLetivoComDataConflitante =
      await this.anoLetivoRepository.obterAnoLetivoPorData(
        request.usuario.escolaId,
        request.dataInicio,
        request.dataFim
      );

    if (anoLetivoComDataConflitante) {
      throw new ConflictError(
        "Ano letivo que contempla as datas informadas já existe!"
      );
    }

    return this.anoLetivoRepository.criarAnoLetivo({
      anoReferencia: request.anoReferencia,
      dataInicio: request.dataInicio,
      dataFim: request.dataFim,
      escolaId: request.usuario.escolaId,
    });
  }
}
