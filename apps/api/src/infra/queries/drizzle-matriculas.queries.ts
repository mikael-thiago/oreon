import { aliasedTable, and, count, eq, sql } from "drizzle-orm";
import type {
  ListarMatriculasRequest,
  ListarMatriculasResponse,
  ListarSolicitacoesRequest,
  ListarSolicitacoesResponse,
  MatriculasQueries,
  ObterDetalhesSolicitacaoResponse,
  ResumoSolicitacoesResponse,
} from "../../application/queries/matriculas.queries.js";
import type { DrizzleService } from "../repositories/drizzle/drizzle.service.js";
import {
  etapaTable,
  estudantesTable,
  matriculasTable,
  modalidadeTable,
  solicitacoesMatriculaTable,
  statusSolicitacaoMatriculaTable,
  pessoasTable,
} from "../repositories/drizzle/schema.js";
import type { FileStorageService } from "../../application/interfaces/file-storage.interface.js";

export class DrizzleMatriculasQueries implements MatriculasQueries {
  constructor(private readonly db: DrizzleService, private readonly fileStorageService: FileStorageService) {}

  async obterResumoSolicitacoesPorUnidadeEAnoLetivo(
    unidadeId: number,
    anoLetivoId: number
  ): Promise<ResumoSolicitacoesResponse> {
    const res = await this.db
      .getTransaction()
      .select({
        status: statusSolicitacaoMatriculaTable.slug,
        quantidade: count(solicitacoesMatriculaTable.id),
      })
      .from(statusSolicitacaoMatriculaTable)
      .leftJoin(
        solicitacoesMatriculaTable,
        and(
          eq(solicitacoesMatriculaTable.statusId, statusSolicitacaoMatriculaTable.id),
          eq(solicitacoesMatriculaTable.unitId, unidadeId),
          eq(solicitacoesMatriculaTable.schoolPeriodId, anoLetivoId)
        )
      )
      .groupBy(statusSolicitacaoMatriculaTable.slug);

    const total = res.reduce((acc, item) => acc + item.quantidade, 0);

    return {
      total,
      statuses: res,
    };
  }

  async listarMatriculas(request: ListarMatriculasRequest): Promise<ListarMatriculasResponse[]> {
    const matriculas = await this.db
      .getTransaction()
      .select({
        id: matriculasTable.id,
        estudante: {
          id: estudantesTable.id,
          nome: pessoasTable.name,
          cpf: pessoasTable.cpf,
          dataDeNascimento: pessoasTable.birthDate,
        },
        status: matriculasTable.status,
        dataCriacao: matriculasTable.createdDate,
        comprovanteResidenciaId: matriculasTable.proofOfResidenceId,
        historicoEscolarId: matriculasTable.scholarHistoryId,
      })
      .from(matriculasTable)
      .innerJoin(estudantesTable, eq(matriculasTable.studentId, estudantesTable.id))
      .innerJoin(pessoasTable, eq(estudantesTable.personId, pessoasTable.id))
      .where(
        and(eq(matriculasTable.unitId, request.unidadeId), eq(matriculasTable.schoolPeriodId, request.periodoLetivoId))
      )
      .orderBy(matriculasTable.createdDate);

    // Fix N+1 problem: Batch sign all URLs at once
    const documentIds = matriculas.flatMap((m) => [m.comprovanteResidenciaId, m.historicoEscolarId]);
    const signedUrls = await this.fileStorageService.signUrlsBatch(documentIds);
    const urlMap = new Map(signedUrls.map((u) => [u.documentId, u.url]));

    return matriculas.map((m) => ({
      id: m.id,
      estudante: m.estudante,
      status: m.status,
      dataCriacao: m.dataCriacao,
      comprovanteResidenciaId: m.comprovanteResidenciaId,
      historicoEscolarId: m.historicoEscolarId,
      downloadUrls: {
        comprovanteResidencia: urlMap.get(m.comprovanteResidenciaId)!,
        historicoEscolar: urlMap.get(m.historicoEscolarId)!,
      },
    }));
  }

  async listarSolicitacoes(request: ListarSolicitacoesRequest): Promise<ListarSolicitacoesResponse[]> {
    const pessoaResponsaveis = aliasedTable(pessoasTable, "pessoa_responsaveis");
    const pessoaEstudantes = aliasedTable(pessoasTable, "pessoa_estudantes");

    const solicitacoes = await this.db
      .getTransaction()
      .select({
        id: solicitacoesMatriculaTable.id,
        estudante: {
          id: estudantesTable.id,
          nome: pessoaEstudantes.name,
          cpf: pessoaEstudantes.cpf,
          dataDeNascimento: pessoaEstudantes.birthDate,
        },
        responsavel: {
          id: pessoaResponsaveis.id,
          nome: pessoaResponsaveis.name,
          cpf: pessoaResponsaveis.cpf,
          telefone: pessoaResponsaveis.phone,
          email: pessoaResponsaveis.email,
        },
        status: statusSolicitacaoMatriculaTable.slug,
        dataSolicitacao: solicitacoesMatriculaTable.createdDate,
        etapa: etapaTable.name,
        modalidade: modalidadeTable.name,
        comprovanteResidenciaId: solicitacoesMatriculaTable.proofOfResidenceId,
        historicoEscolarId: solicitacoesMatriculaTable.scholarHistoryId,
      })
      .from(solicitacoesMatriculaTable)
      .innerJoin(estudantesTable, eq(solicitacoesMatriculaTable.studentId, estudantesTable.id))
      .innerJoin(pessoaEstudantes, eq(estudantesTable.personId, pessoaEstudantes.id))
      .innerJoin(pessoaResponsaveis, eq(solicitacoesMatriculaTable.responsibleId, pessoaResponsaveis.id))
      .innerJoin(etapaTable, eq(solicitacoesMatriculaTable.stepId, etapaTable.id))
      .innerJoin(modalidadeTable, eq(etapaTable.modalityId, modalidadeTable.id))
      .innerJoin(
        statusSolicitacaoMatriculaTable,
        eq(solicitacoesMatriculaTable.statusId, statusSolicitacaoMatriculaTable.id)
      )
      .where(
        and(
          eq(solicitacoesMatriculaTable.unitId, request.unidadeId),
          eq(solicitacoesMatriculaTable.schoolPeriodId, request.periodoLetivoId),
          eq(modalidadeTable.id, request.modalidadeId)
        )
      )
      .orderBy(solicitacoesMatriculaTable.createdDate);

    // Fix N+1 problem: Batch sign all URLs at once
    const documentIds = solicitacoes.flatMap((s) => [s.comprovanteResidenciaId, s.historicoEscolarId]);
    const signedUrls = await this.fileStorageService.signUrlsBatch(documentIds);
    const urlMap = new Map(signedUrls.map((u) => [u.documentId, u.url]));

    return solicitacoes.map((s) => ({
      id: s.id,
      estudante: s.estudante,
      responsavel: {
        ...s.responsavel,
        telefone: s.responsavel.telefone!,
        email: s.responsavel.email!,
      },
      status: s.status,
      dataSolicitacao: s.dataSolicitacao,
      etapa: s.etapa,
      modalidade: s.modalidade,
      comprovanteResidenciaId: s.comprovanteResidenciaId,
      historicoEscolarId: s.historicoEscolarId,
      downloadUrls: {
        comprovanteResidencia: urlMap.get(s.comprovanteResidenciaId)!,
        historicoEscolar: urlMap.get(s.historicoEscolarId)!,
      },
    }));
  }

  async obterDetalhesSolicitacao(id: number): Promise<ObterDetalhesSolicitacaoResponse | null> {
    const pessoaResponsaveis = aliasedTable(pessoasTable, "pessoa_responsaveis");
    const pessoaEstudantes = aliasedTable(pessoasTable, "pessoa_estudantes");

    const [solicitacao] = await this.db
      .getTransaction()
      .select({
        id: solicitacoesMatriculaTable.id,
        unidadeId: solicitacoesMatriculaTable.unitId,
        estudante: {
          id: estudantesTable.id,
          nome: pessoaEstudantes.name,
          cpf: pessoaEstudantes.cpf,
          dataDeNascimento: pessoaEstudantes.birthDate,
        },
        responsavel: {
          id: pessoaResponsaveis.id,
          nome: pessoaResponsaveis.name,
          cpf: pessoaResponsaveis.cpf,
          telefone: pessoaResponsaveis.phone,
          email: pessoaResponsaveis.email,
        },
        status: statusSolicitacaoMatriculaTable.slug,
        dataSolicitacao: solicitacoesMatriculaTable.createdDate,
        etapa: etapaTable.name,
        modalidade: modalidadeTable.name,
        comprovanteResidenciaId: solicitacoesMatriculaTable.proofOfResidenceId,
        historicoEscolarId: solicitacoesMatriculaTable.scholarHistoryId,
      })
      .from(solicitacoesMatriculaTable)
      .innerJoin(estudantesTable, eq(solicitacoesMatriculaTable.studentId, estudantesTable.id))
      .innerJoin(pessoaEstudantes, eq(estudantesTable.personId, pessoaResponsaveis.id))
      .innerJoin(pessoaResponsaveis, eq(solicitacoesMatriculaTable.responsibleId, pessoaResponsaveis.id))
      .innerJoin(etapaTable, eq(solicitacoesMatriculaTable.stepId, etapaTable.id))
      .innerJoin(modalidadeTable, eq(etapaTable.modalityId, modalidadeTable.id))
      .innerJoin(
        statusSolicitacaoMatriculaTable,
        eq(solicitacoesMatriculaTable.statusId, statusSolicitacaoMatriculaTable.id)
      )
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
      responsavel: {
        ...solicitacao.responsavel,
        telefone: solicitacao.responsavel.telefone!,
        email: solicitacao.responsavel.email!,
      },
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
