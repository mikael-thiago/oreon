import { SolicitacaoMatricula } from "../entities/solicitacao-matricula.entity.js";
import type { RelacaoResponsabilidade } from "../enums/relacao-responsabilidade.enum.js";
import type { StatusSolicitacaoMatricula } from "../enums/status-solicitacao-matricula.enum.js";

export type CriarSolicitacaoMatriculaRequest = {
  readonly unidadeId: number;
  readonly estudanteId: number;
  readonly responsavelId: number;
  readonly periodoEscolarId: number;
  readonly etapaId: number;
  readonly relacaoResponsabilidade: RelacaoResponsabilidade;
  readonly status: StatusSolicitacaoMatricula;
  readonly dataSolicitacao: Date;
  readonly comprovanteDeResidenciaId: number;
  readonly historicoEscolarId: number;
  readonly documentoAlunoId: number;
  readonly documentoResponsavelId: number;
  readonly observacoes: string | null;
};

export abstract class SolicitacaoMatriculaRepository {
  abstract criarSolicitacaoMatricula(request: CriarSolicitacaoMatriculaRequest): Promise<SolicitacaoMatricula>;
  abstract obterSolicitacaoMatriculaPorEstudanteEPeriodoEscolar(
    estudanteId: number,
    periodoEscolarId: number
  ): Promise<SolicitacaoMatricula | null>;
  abstract obterSolicitacaoMatriculaPorId(id: number): Promise<SolicitacaoMatricula | null>;
}
