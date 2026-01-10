import { and, eq, sql } from "drizzle-orm";
import { SolicitacaoMatricula } from "../../../domain/entities/solicitacao-matricula.entity.js";
import type { SolicitacaoMatriculaRepository } from "../../../domain/repositories/solicitacao-matricula.repository.js";
import type { RelacaoResponsabilidade } from "../../../domain/enums/relacao-responsabilidade.enum.js";
import { DateFormatter } from "@oreon/utils/date-formatter";
import type { DrizzleService } from "./drizzle.service.js";
import { responsabilityRelationsTable, solicitacoesMatriculaTable, statusSolicitacaoMatriculaTable } from "./schema.js";
import { DateFormatEnum } from "@oreon/utils/date-format";

export class DrizzleSolicitacaoMatriculaRepository implements SolicitacaoMatriculaRepository {
  constructor(private readonly drizzleDb: DrizzleService) {}

  async obterProximoId(): Promise<number> {
    const res = await this.drizzleDb
      .getTransaction()
      .execute<{ readonly id: number }>(sql`SELECT NEXTVAL('matriculation_requests_id_seq') AS "id"`);

    return res.rows[0]!.id;
  }

  private async obterStatusIdPorSlug(statusSlug: string): Promise<number> {
    const [statusResult] = await this.drizzleDb
      .getTransaction()
      .select({ id: statusSolicitacaoMatriculaTable.id })
      .from(statusSolicitacaoMatriculaTable)
      .where(eq(statusSolicitacaoMatriculaTable.slug, statusSlug));

    if (!statusResult) {
      throw new Error(`Status de solicitação inválido: ${statusSlug}`);
    }

    return statusResult.id;
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
        statusSlug: statusSolicitacaoMatriculaTable.slug,
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
      .innerJoin(
        statusSolicitacaoMatriculaTable,
        eq(solicitacoesMatriculaTable.statusId, statusSolicitacaoMatriculaTable.id)
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

    return SolicitacaoMatricula.reconstituir({
      id: solicitacaoModel.id,
      unidadeId: solicitacaoModel.unitId,
      estudanteId: solicitacaoModel.studentId,
      responsavelId: solicitacaoModel.responsibleId,
      periodoEscolarId: solicitacaoModel.schoolPeriodId,
      etapaId: solicitacaoModel.stepId,
      relacaoResponsabilidade: solicitacaoModel.responsabilityRelationSlug as RelacaoResponsabilidade,
      status: solicitacaoModel.statusSlug as any,
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
        statusSlug: statusSolicitacaoMatriculaTable.slug,
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
      .innerJoin(
        statusSolicitacaoMatriculaTable,
        eq(solicitacoesMatriculaTable.statusId, statusSolicitacaoMatriculaTable.id)
      )
      .where(eq(solicitacoesMatriculaTable.id, id));

    if (!solicitacaoModel) {
      return null;
    }

    return SolicitacaoMatricula.reconstituir({
      id: solicitacaoModel.id,
      unidadeId: solicitacaoModel.unitId,
      estudanteId: solicitacaoModel.studentId,
      responsavelId: solicitacaoModel.responsibleId,
      periodoEscolarId: solicitacaoModel.schoolPeriodId,
      etapaId: solicitacaoModel.stepId,
      relacaoResponsabilidade: solicitacaoModel.responsabilityRelationSlug as RelacaoResponsabilidade,
      status: solicitacaoModel.statusSlug as any,
      dataSolicitacao: new Date(solicitacaoModel.createdDate),
      comprovanteDeResidenciaId: solicitacaoModel.proofOfResidenceId,
      historicoEscolarId: solicitacaoModel.scholarHistoryId,
      documentoAlunoId: solicitacaoModel.studentDocumentId,
      documentoResponsavelId: solicitacaoModel.responsibleDocumentId,
      observacoes: solicitacaoModel.observations,
    });
  }

  async salvar(solicitacao: SolicitacaoMatricula): Promise<SolicitacaoMatricula> {
    const [relationResult] = await this.drizzleDb
      .getTransaction()
      .select({ id: responsabilityRelationsTable.id })
      .from(responsabilityRelationsTable)
      .where(eq(responsabilityRelationsTable.slug, solicitacao.relacaoResponsabilidade));

    if (!relationResult) {
      throw new Error(`Relação de responsabilidade inválida: ${solicitacao.relacaoResponsabilidade}`);
    }

    const responsibilityRelationId = relationResult.id;

    const statusId = await this.obterStatusIdPorSlug(solicitacao.status);

    const [solicitacaoModel] = await this.drizzleDb
      .getTransaction()
      .insert(solicitacoesMatriculaTable)
      .values({
        id: solicitacao.id,
        unitId: solicitacao.unidadeId,
        studentId: solicitacao.estudanteId,
        responsibleId: solicitacao.responsavelId,
        schoolPeriodId: solicitacao.periodoEscolarId,
        stepId: solicitacao.etapaId,
        statusId: statusId,
        createdDate: DateFormatter.format(solicitacao.dataSolicitacao, DateFormatEnum.ISO_DATE),
        proofOfResidenceId: solicitacao.comprovanteDeResidenciaId,
        scholarHistoryId: solicitacao.historicoEscolarId,
        studentDocumentId: solicitacao.documentoAlunoId,
        responsibleDocumentId: solicitacao.documentoResponsavelId,
        observations: solicitacao.observacoes,
        responsibilityRelationId,
      })
      .returning();

    if (!solicitacaoModel) {
      throw new Error("Falha ao criar solicitação de matrícula");
    }

    return solicitacao;
  }
}
