import { Matricula } from "../entities/Matricula.js";
import type { StatusMatricula } from "../enums/StatusMatriculaEnum.js";

export type ObterMatriculaAlunoAnoLetivoRequest = {
  readonly alunoId: number;
  readonly anoLetivoId: number;
};

export abstract class MatriculaRepository {
  abstract obterMatriculaAlunoAnoLetivo(
    request: ObterMatriculaAlunoAnoLetivoRequest
  ): Promise<Matricula | null>;
  abstract criarMatricula(request: {
    readonly alunoId: number;
    readonly dataInicio: Date;
    readonly dataFim?: Date | null;
    readonly anoLetivoId: number;
    readonly turmaId: number;
    readonly status: StatusMatricula;
  }): Promise<Matricula>;
}
