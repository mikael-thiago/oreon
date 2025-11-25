import { AnoLetivoRepository } from "../../domain/repositories/AnoLetivoRepository.js";
import { BaseCurricularRepository } from "../../domain/repositories/BaseCurricularRepository.js";
import { TurmaRepository } from "../../domain/repositories/TurmaRepository.js";

export type CadastrarTurmaRequest = {
  readonly anoLetivoId: number;
  readonly baseId: number;
  readonly etapaId: number;
  readonly letra: string;
};

export class CadastrarTurmaUseCase {
  private readonly anoLetivoRepository: AnoLetivoRepository;
  private readonly baseRepository: BaseCurricularRepository;
  private readonly turmaRepository: TurmaRepository;

  constructor(
    anoLetivoRepository: AnoLetivoRepository,
    baseRepository: BaseCurricularRepository,
    turmaRepository: TurmaRepository
  ) {
    this.anoLetivoRepository = anoLetivoRepository;
    this.baseRepository = baseRepository;
    this.turmaRepository = turmaRepository;
  }

  async executar(request: CadastrarTurmaRequest) {
    const [anoExiste, baseExiste] = await Promise.all([
      this.anoLetivoRepository.existe(request.anoLetivoId),
      this.baseRepository.existe(request.baseId),
    ]);

    if (!anoExiste)
      throw new Error(`Ano letivo com id ${request.anoLetivoId} não existe!`);
    if (!baseExiste)
      throw new Error(`Base curricular com id ${request.baseId} não existe!`);
    if (await this.turmaRepository.existeTurmaPorAnoELetra(request))
      throw new Error(
        "Já existe uma turma com essa letra cadastrada nesse ano letivo!"
      );

    const turma = await this.turmaRepository.criarTurma(request);

    return turma;
  }
}
