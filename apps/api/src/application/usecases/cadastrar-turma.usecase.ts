import { ConflictError } from "../../domain/errors/conflict.error.js";
import { IllegalArgumentError } from "../../domain/errors/illegal-argument.error.js";
import { AnoLetivoRepository } from "../../domain/repositories/ano-letivo.repository.js";
import { BaseCurricularRepository } from "../../domain/repositories/base-curricular.repository.js";
import { TurmaRepository } from "../../domain/repositories/turma.repository.js";
import type { UnidadeEscolarRepository } from "../../domain/repositories/unidade-escola.repository.js";

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
