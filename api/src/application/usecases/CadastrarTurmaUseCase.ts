import { ConflictError } from "../../domain/errors/ConflictError.js";
import { IllegalArgumentError } from "../../domain/errors/IllegalArgumentError.js";
import { AnoLetivoRepository } from "../../domain/repositories/AnoLetivoRepository.js";
import { BaseCurricularRepository } from "../../domain/repositories/BaseCurricularRepository.js";
import { TurmaRepository } from "../../domain/repositories/TurmaRepository.js";
import type { UnidadeEscolarRepository } from "../../domain/repositories/UnidadeEscolaRepository.js";

export type CadastrarTurmaRequest = {
  readonly anoLetivoId: number;
  readonly baseId: number;
  readonly letra: string;
  readonly unidadeId: number;
  readonly limiteDeAlunos: number;
};

export class CadastrarTurmaUseCase {
  constructor(
    private readonly anoLetivoRepository: AnoLetivoRepository,
    private readonly baseRepository: BaseCurricularRepository,
    private readonly turmaRepository: TurmaRepository,
    private readonly unidadeEscolarRepository: UnidadeEscolarRepository
  ) {}

  async executar(request: CadastrarTurmaRequest) {
    const [anoExiste, base, unidadeExiste] = await Promise.all([
      this.anoLetivoRepository.existe(request.anoLetivoId),
      this.baseRepository.obterPorId(request.baseId),
      this.unidadeEscolarRepository.existeComId(request.unidadeId),
    ]);

    if (!anoExiste) throw new IllegalArgumentError(`Ano letivo com id ${request.anoLetivoId} não existe!`);
    if (!base) throw new IllegalArgumentError(`Base curricular com id ${request.baseId} não existe!`);
    if (!unidadeExiste) throw new IllegalArgumentError(`Unidade escolar com id ${request.unidadeId} não existe!`);
    if (
      await this.turmaRepository.existeTurmaPorEtapaAnoELetra({
        anoLetivoId: request.anoLetivoId,
        etapaId: base.etapaId,
        letra: request.letra,
        unidadeId: request.unidadeId,
      })
    )
      throw new ConflictError("Já existe uma turma com essa letra cadastrada nesse ano letivo!");

    const turma = await this.turmaRepository.criarTurma(request);

    return turma;
  }
}
