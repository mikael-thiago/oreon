import { Matricula } from "../entities/matricula.entity.js";

export abstract class MatriculaRepository {
  abstract obterProximoId(): Promise<number>;
  abstract obterMatriculaPorEstudanteEPeriodoLetivo(
    estudanteId: number,
    periodoLetivoId: number
  ): Promise<Matricula | null>;
  abstract salvar(matricula: Matricula): Promise<Matricula>;
}
