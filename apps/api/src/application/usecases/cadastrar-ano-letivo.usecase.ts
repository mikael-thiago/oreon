import { AnoLetivo } from "../../domain/entities/ano-letivo.entity.js";
import { ConflictError } from "../../domain/errors/conflict.error.js";
import { AnoLetivoRepository } from "../../domain/repositories/ano-letivo.repository.js";
import type { UsuarioAutenticado } from "../types/authenticated-user.type.js";
import { Result } from "../../domain/shared/result.js";

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

  async executar(request: CadastrarAnoLetivoRequest): Promise<Result<AnoLetivo, ConflictError>> {
    const anoLetivoAnoConflitante = await this.anoLetivoRepository.obterAnoLetivoPorAno(
      request.usuario.escolaId,
      request.anoReferencia
    );

    if (anoLetivoAnoConflitante) {
      return Result.fail(new ConflictError("Ano letivo com mesmo ano já existe!"));
    }

    const anoLetivoComDataConflitante = await this.anoLetivoRepository.obterAnoLetivoPorData(
      request.usuario.escolaId,
      request.dataInicio,
      request.dataFim
    );

    if (anoLetivoComDataConflitante) {
      return Result.fail(new ConflictError("Ano letivo que contempla as datas informadas já existe!"));
    }

    const anoLetivo = await this.anoLetivoRepository.salvar(
      new AnoLetivo({
        id: await this.anoLetivoRepository.obterProximoId(),
        anoReferencia: request.anoReferencia,
        dataInicio: request.dataInicio,
        dataFim: request.dataFim,
        escolaId: request.usuario.escolaId,
      })
    );

    return Result.ok(anoLetivo);
  }
}
