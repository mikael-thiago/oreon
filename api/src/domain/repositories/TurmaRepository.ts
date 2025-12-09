import { Turma } from "../entities/Turma.js";

export abstract class TurmaRepository {
  abstract obterPorId(id: number): Promise<Turma | null>;
  abstract criarTurma(request: {
    readonly anoLetivoId: number;
    readonly baseId: number;
    readonly letra: string;
    readonly unidadeId: number;
  }): Promise<Turma>;
  abstract existeTurmaPorEtapaAnoELetra(request: {
    readonly anoLetivoId: number;
    readonly etapaId: number;
    readonly letra: string;
    readonly unidadeId: number;
  }): Promise<boolean>;
}
