import { Matricula } from "../entities/matricula.entity.js";
import type { StatusMatricula } from "../enums/status-matricula.enum.js";

export type CriarMatriculaRequest = {
  readonly unidadeId: number;
  readonly estudanteId: number;
  readonly periodoLetivoId: number;
  readonly status: StatusMatricula;
  readonly dataCriacao: Date;
  readonly comprovanteResidenciaId: number;
  readonly historicoEscolarId: number;
};

export abstract class MatriculaRepository {
  abstract criarMatricula(request: CriarMatriculaRequest): Promise<Matricula>;
  abstract obterMatriculaPorEstudanteEPeriodoLetivo(
    estudanteId: number,
    periodoLetivoId: number
  ): Promise<Matricula | null>;
}
