import { and, eq } from "drizzle-orm";
import { SolicitacaoMatricula } from "../../../domain/entities/solicitacao-matricula.entity.js";
import type { SolicitacaoMatriculaRepository, CriarSolicitacaoMatriculaRequest } from "../../../domain/repositories/solicitacao-matricula.repository.js";
import type { RelacaoResponsabilidade } from "../../../domain/enums/relacao-responsabilidade.enum.js";
import { DateFormatter } from "@oreon/utils/date-formatter";
import type { DrizzleService } from "./drizzle.service.js";
import { responsabilityRelationsTable, solicitacoesMatriculaTable } from "./schema.js";
import { DateFormatEnum } from "@oreon/utils/date-format";

export class DrizzleSolicitacaoMatriculaRepository implements SolicitacaoMatriculaRepository {
  constructor(private readonly drizzleDb: DrizzleService) {}

  async criarSolicitacaoMatricula(request: CriarSolicitacaoMatriculaRequest): Promise<SolicitacaoMatricula> {
    const [relationResult] = await this.drizzleDb
      .getTransaction()
      .select({ id: responsabilityRelationsTable.id })
      .from(responsabilityRelationsTable)
      .where(eq(responsabilityRelationsTable.slug, request.relacaoResponsabilidade));

    if (!relationResult) {
      throw new Error(`Relação de responsabilidade inválida: ${request.relacaoResponsabilidade}`);
    }

    const responsibilityRelationId = relationResult.id;

    const [solicitacaoModel] = await this.drizzleDb
      .getTransaction()
      .insert(solicitacoesMatriculaTable)
      .values({
        unitId: request.unidadeId,
        studentId: request.estudanteId,
        responsibleId: request.responsavelId,
        schoolPeriodId: request.periodoEscolarId,
        stepId: request.etapaId,
        status: request.status,
        createdDate: DateFormatter.format(request.dataSolicitacao, DateFormatEnum.ISO_DATE),
        proofOfResidenceId: request.comprovanteDeResidenciaId,
        scholarHistoryId: request.historicoEscolarId,
        studentDocumentId: request.documentoAlunoId,
        responsibleDocumentId: request.documentoResponsavelId,
        observations: request.observacoes,
        responsibilityRelationId
      })
      .returning();

    if (!solicitacaoModel) {
      throw new Error("Falha ao criar solicitação de matrícula");
    }

    return new SolicitacaoMatricula({
      id: solicitacaoModel.id,
      unidadeId: solicitacaoModel.unitId,
      estudanteId: solicitacaoModel.studentId,
      responsavelId: solicitacaoModel.responsibleId,
      periodoEscolarId: solicitacaoModel.schoolPeriodId,
      etapaId: solicitacaoModel.stepId,
      relacaoResponsabilidade: request.relacaoResponsabilidade,
      status: solicitacaoModel.status as any,
      dataSolicitacao: new Date(solicitacaoModel.createdDate),
      comprovanteDeResidenciaId: solicitacaoModel.proofOfResidenceId,
      historicoEscolarId: solicitacaoModel.scholarHistoryId,
      documentoAlunoId: solicitacaoModel.studentDocumentId,
      documentoResponsavelId: solicitacaoModel.responsibleDocumentId,
      observacoes: solicitacaoModel.observations,
    });
  }

  async obterSolicitacaoMatriculaPorEstudanteEPeriodoEscolar(
    estudanteId: number,
    periodoEscolarId: number
  ): Promise<SolicitacaoMatricula | null> {
    const [solicitacaoModel] = await this.drizzleDb
      .getTransaction()
      .select({
        id: solicitacoesMatriculaTable.id,
        unitId: solicitacoesMatriculaTable.unitId,
        studentId: solicitacoesMatriculaTable.studentId,
        responsibleId: solicitacoesMatriculaTable.responsibleId,
        schoolPeriodId: solicitacoesMatriculaTable.schoolPeriodId,
        stepId: solicitacoesMatriculaTable.stepId,
        responsabilityRelationSlug: responsabilityRelationsTable.slug,
        status: solicitacoesMatriculaTable.status,
        createdDate: solicitacoesMatriculaTable.createdDate,
        proofOfResidenceId: solicitacoesMatriculaTable.proofOfResidenceId,
        scholarHistoryId: solicitacoesMatriculaTable.scholarHistoryId,
        studentDocumentId: solicitacoesMatriculaTable.studentDocumentId,
        responsibleDocumentId: solicitacoesMatriculaTable.responsibleDocumentId,
        observations: solicitacoesMatriculaTable.observations,
      })
      .from(solicitacoesMatriculaTable)
      .innerJoin(
        responsabilityRelationsTable,
        eq(solicitacoesMatriculaTable.responsibilityRelationId, responsabilityRelationsTable.id)
      )
      .where(
        and(
          eq(solicitacoesMatriculaTable.studentId, estudanteId),
          eq(solicitacoesMatriculaTable.schoolPeriodId, periodoEscolarId)
        )
      );

    if (!solicitacaoModel) {
      return null;
    }

    return new SolicitacaoMatricula({
      id: solicitacaoModel.id,
      unidadeId: solicitacaoModel.unitId,
      estudanteId: solicitacaoModel.studentId,
      responsavelId: solicitacaoModel.responsibleId,
      periodoEscolarId: solicitacaoModel.schoolPeriodId,
      etapaId: solicitacaoModel.stepId,
      relacaoResponsabilidade: solicitacaoModel.responsabilityRelationSlug as RelacaoResponsabilidade,
      status: solicitacaoModel.status as any,
      dataSolicitacao: new Date(solicitacaoModel.createdDate),
      comprovanteDeResidenciaId: solicitacaoModel.proofOfResidenceId,
      historicoEscolarId: solicitacaoModel.scholarHistoryId,
      documentoAlunoId: solicitacaoModel.studentDocumentId,
      documentoResponsavelId: solicitacaoModel.responsibleDocumentId,
      observacoes: solicitacaoModel.observations,
    });
  }

  async obterSolicitacaoMatriculaPorId(id: number): Promise<SolicitacaoMatricula | null> {
    const [solicitacaoModel] = await this.drizzleDb
      .getTransaction()
      .select({
        id: solicitacoesMatriculaTable.id,
        unitId: solicitacoesMatriculaTable.unitId,
        studentId: solicitacoesMatriculaTable.studentId,
        responsibleId: solicitacoesMatriculaTable.responsibleId,
        schoolPeriodId: solicitacoesMatriculaTable.schoolPeriodId,
        stepId: solicitacoesMatriculaTable.stepId,
        responsabilityRelationSlug: responsabilityRelationsTable.slug,
        status: solicitacoesMatriculaTable.status,
        createdDate: solicitacoesMatriculaTable.createdDate,
        proofOfResidenceId: solicitacoesMatriculaTable.proofOfResidenceId,
        scholarHistoryId: solicitacoesMatriculaTable.scholarHistoryId,
        studentDocumentId: solicitacoesMatriculaTable.studentDocumentId,
        responsibleDocumentId: solicitacoesMatriculaTable.responsibleDocumentId,
        observations: solicitacoesMatriculaTable.observations,
      })
      .from(solicitacoesMatriculaTable)
      .innerJoin(
        responsabilityRelationsTable,
        eq(solicitacoesMatriculaTable.responsibilityRelationId, responsabilityRelationsTable.id)
      )
      .where(eq(solicitacoesMatriculaTable.id, id));

    if (!solicitacaoModel) {
      return null;
    }

    return new SolicitacaoMatricula({
      id: solicitacaoModel.id,
      unidadeId: solicitacaoModel.unitId,
      estudanteId: solicitacaoModel.studentId,
      responsavelId: solicitacaoModel.responsibleId,
      periodoEscolarId: solicitacaoModel.schoolPeriodId,
      etapaId: solicitacaoModel.stepId,
      relacaoResponsabilidade: solicitacaoModel.responsabilityRelationSlug as RelacaoResponsabilidade,
      status: solicitacaoModel.status as any,
      dataSolicitacao: new Date(solicitacaoModel.createdDate),
      comprovanteDeResidenciaId: solicitacaoModel.proofOfResidenceId,
      historicoEscolarId: solicitacaoModel.scholarHistoryId,
      documentoAlunoId: solicitacaoModel.studentDocumentId,
      documentoResponsavelId: solicitacaoModel.responsibleDocumentId,
      observacoes: solicitacaoModel.observations,
    });
  }
}
