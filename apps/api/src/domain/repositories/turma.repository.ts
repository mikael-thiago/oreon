import { Turma } from "../entities/turma.entity.js";

export abstract class TurmaRepository {
  abstract obterProximoId(): Promise<number>;
  abstract obterPorId(id: number): Promise<Turma | null>;
  abstract existeTurmaPorEtapaAnoELetra(request: {
    readonly anoLetivoId: number;
    readonly etapaId: number;
    readonly letra: string;
    readonly unidadeId: number;
  }): Promise<boolean>;
  abstract salvar(turma: Turma): Promise<Turma>;
}
