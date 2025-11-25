import { Turma } from "../entities/Turma.js";

export abstract class TurmaRepository {
  abstract obterPorId(id: number): Promise<Turma | null>;
  abstract criarTurma(request: {
    readonly anoLetivoId: number;
    readonly baseId: number;
    readonly letra: string;
  }): Promise<Turma>;
  abstract existeTurmaPorAnoELetra(request: {
    readonly anoLetivoId: number;
    readonly letra: string;
  }): Promise<boolean>;
}
