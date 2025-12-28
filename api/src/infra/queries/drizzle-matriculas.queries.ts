import { and, eq } from "drizzle-orm";
import type {
  ListarMatriculasRequest,
  ListarMatriculasResponse,
  ListarSolicitacoesRequest,
  ListarSolicitacoesResponse,
  MatriculasQueries,
  ObterDetalhesSolicitacaoResponse,
} from "../../application/queries/matriculas.queries.js";
import type { DrizzleService } from "../repositories/drizzle/drizzle.service.js";
import {
  etapaTable,
  estudantesTable,
  matriculasTable,
  modalidadeTable,
  responsaveisTable,
  solicitacoesMatriculaTable,
} from "../repositories/drizzle/schema.js";
import type { FileStorageService } from "../../application/interfaces/file-storage.interface.js";

export class DrizzleMatriculasQueries implements MatriculasQueries {
  constructor(
    private readonly db: DrizzleService,
    private readonly fileStorageService: FileStorageService
  ) {}

  async listarMatriculas(request: ListarMatriculasRequest): Promise<ListarMatriculasResponse[]> {
    const matriculas = await this.db
      .getTransaction()
      .select({
        id: matriculasTable.id,
        estudante: {
          id: estudantesTable.id,
          nome: estudantesTable.name,
          cpf: estudantesTable.cpf,
          dataDeNascimento: estudantesTable.birthDate,
        },
        status: matriculasTable.status,
        dataCriacao: matriculasTable.createdDate,
        comprovanteResidenciaId: matriculasTable.proofOfResidenceId,
        historicoEscolarId: matriculasTable.scholarHistoryId,
      })
      .from(matriculasTable)
      .innerJoin(estudantesTable, eq(matriculasTable.studentId, estudantesTable.id))
      .where(
        and(
          eq(matriculasTable.unitId, request.unidadeId),
          eq(matriculasTable.schoolPeriodId, request.periodoLetivoId)
        )
      )
      .orderBy(matriculasTable.createdDate);

    return Promise.all(
      matriculas.map(async (m) => {
        const comprovanteUrl = await this.fileStorageService.signUrl({
          documentId: m.comprovanteResidenciaId,
        });
        const historicoUrl = await this.fileStorageService.signUrl({
          documentId: m.historicoEscolarId,
        });

        return {
          id: m.id,
          estudante: m.estudante,
          status: m.status,
          dataCriacao: m.dataCriacao,
          comprovanteResidenciaId: m.comprovanteResidenciaId,
          historicoEscolarId: m.historicoEscolarId,
          downloadUrls: {
            comprovanteResidencia: comprovanteUrl,
            historicoEscolar: historicoUrl,
          },
        };
      })
    );
  }

  async listarSolicitacoes(request: ListarSolicitacoesRequest): Promise<ListarSolicitacoesResponse[]> {
    const solicitacoes = await this.db
      .getTransaction()
      .select({
        id: solicitacoesMatriculaTable.id,
        estudante: {
          id: estudantesTable.id,
          nome: estudantesTable.name,
          cpf: estudantesTable.cpf,
          dataDeNascimento: estudantesTable.birthDate,
        },
        responsavel: {
          id: responsaveisTable.id,
          nome: responsaveisTable.name,
          cpf: responsaveisTable.cpf,
          telefone: responsaveisTable.phone,
          email: responsaveisTable.email,
        },
        status: solicitacoesMatriculaTable.status,
        dataSolicitacao: solicitacoesMatriculaTable.createdDate,
        etapa: etapaTable.name,
        modalidade: modalidadeTable.name,
        comprovanteResidenciaId: solicitacoesMatriculaTable.proofOfResidenceId,
        historicoEscolarId: solicitacoesMatriculaTable.scholarHistoryId,
      })
      .from(solicitacoesMatriculaTable)
      .innerJoin(estudantesTable, eq(solicitacoesMatriculaTable.studentId, estudantesTable.id))
      .innerJoin(responsaveisTable, eq(solicitacoesMatriculaTable.responsibleId, responsaveisTable.id))
      .innerJoin(etapaTable, eq(solicitacoesMatriculaTable.stepId, etapaTable.id))
      .innerJoin(modalidadeTable, eq(etapaTable.modalityId, modalidadeTable.id))
      .where(
        and(
          eq(solicitacoesMatriculaTable.unitId, request.unidadeId),
          eq(solicitacoesMatriculaTable.schoolPeriodId, request.periodoLetivoId)
        )
      )
      .orderBy(solicitacoesMatriculaTable.createdDate);

    return Promise.all(
      solicitacoes.map(async (s) => {
        const comprovanteUrl = await this.fileStorageService.signUrl({
          documentId: s.comprovanteResidenciaId,
        });
        const historicoUrl = await this.fileStorageService.signUrl({
          documentId: s.historicoEscolarId,
        });

        return {
          id: s.id,
          estudante: s.estudante,
          responsavel: s.responsavel,
          status: s.status,
          dataSolicitacao: s.dataSolicitacao,
          etapa: s.etapa,
          modalidade: s.modalidade,
          comprovanteResidenciaId: s.comprovanteResidenciaId,
          historicoEscolarId: s.historicoEscolarId,
          downloadUrls: {
            comprovanteResidencia: comprovanteUrl,
            historicoEscolar: historicoUrl,
          },
        };
      })
    );
  }

  async obterDetalhesSolicitacao(id: number): Promise<ObterDetalhesSolicitacaoResponse | null> {
    const [solicitacao] = await this.db
      .getTransaction()
      .select({
        id: solicitacoesMatriculaTable.id,
        unidadeId: solicitacoesMatriculaTable.unitId,
        estudante: {
          id: estudantesTable.id,
          nome: estudantesTable.name,
          cpf: estudantesTable.cpf,
          dataDeNascimento: estudantesTable.birthDate,
        },
        responsavel: {
          id: responsaveisTable.id,
          nome: responsaveisTable.name,
          cpf: responsaveisTable.cpf,
          telefone: responsaveisTable.phone,
          email: responsaveisTable.email,
        },
        status: solicitacoesMatriculaTable.status,
        dataSolicitacao: solicitacoesMatriculaTable.createdDate,
        etapa: etapaTable.name,
        modalidade: modalidadeTable.name,
        comprovanteResidenciaId: solicitacoesMatriculaTable.proofOfResidenceId,
        historicoEscolarId: solicitacoesMatriculaTable.scholarHistoryId,
      })
      .from(solicitacoesMatriculaTable)
      .innerJoin(estudantesTable, eq(solicitacoesMatriculaTable.studentId, estudantesTable.id))
      .innerJoin(responsaveisTable, eq(solicitacoesMatriculaTable.responsibleId, responsaveisTable.id))
      .innerJoin(etapaTable, eq(solicitacoesMatriculaTable.stepId, etapaTable.id))
      .innerJoin(modalidadeTable, eq(etapaTable.modalityId, modalidadeTable.id))
      .where(eq(solicitacoesMatriculaTable.id, id));

    if (!solicitacao) {
      return null;
    }

    const comprovanteUrl = await this.fileStorageService.signUrl({
      documentId: solicitacao.comprovanteResidenciaId,
    });
    const historicoUrl = await this.fileStorageService.signUrl({
      documentId: solicitacao.historicoEscolarId,
    });

    return {
      id: solicitacao.id,
      unidadeId: solicitacao.unidadeId,
      estudante: solicitacao.estudante,
      responsavel: solicitacao.responsavel,
      status: solicitacao.status,
      dataSolicitacao: solicitacao.dataSolicitacao,
      etapa: solicitacao.etapa,
      modalidade: solicitacao.modalidade,
      comprovanteResidenciaId: solicitacao.comprovanteResidenciaId,
      historicoEscolarId: solicitacao.historicoEscolarId,
      downloadUrls: {
        comprovanteResidencia: comprovanteUrl,
        historicoEscolar: historicoUrl,
      },
    };
  }
}
