import { SolicitacaoMatricula } from "../entities/solicitacao-matricula.entity.js";

export abstract class SolicitacaoMatriculaRepository {
  abstract obterProximoId(): Promise<number>;
  abstract salvar(solicitacao: SolicitacaoMatricula): Promise<SolicitacaoMatricula>;
  abstract obterSolicitacaoMatriculaPorEstudanteEPeriodoEscolar(
    estudanteId: number,
    periodoEscolarId: number
  ): Promise<SolicitacaoMatricula | null>;
  abstract obterSolicitacaoMatriculaPorId(id: number): Promise<SolicitacaoMatricula | null>;
}
