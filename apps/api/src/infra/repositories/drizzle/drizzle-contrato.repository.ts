import { and, eq, sql } from "drizzle-orm";
import type { Contrato } from "../../../domain/entities/contrato.entity.js";
import { ContratoComum, ContratoProfessor } from "../../../domain/entities/contrato.entity.js";
import { StatusContratoEnum, type StatusContrato } from "../../../domain/enums/status-contrato.enum.js";
import type { ContratoRepository } from "../../../domain/repositories/contrato.repository.js";
import { DateFormatter } from "@oreon/utils/date-formatter";
import type { DrizzleService } from "./drizzle.service.js";
import { contratosTable, contratoProfessorDisciplinaTable } from "./schema.js";

export class DrizzleContratoRepository implements ContratoRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async obterProximoId(): Promise<number> {
    const res = await this.drizzle
      .getTransaction()
      .execute<{ readonly id: number }>(sql`SELECT NEXTVAL('contracts_id_seq') AS "id"`);

    return res.rows[0]!.id;
  }

  async salvar<TContrato extends Contrato>(contrato: TContrato): Promise<TContrato> {
    const [updated] = await this.drizzle
      .getTransaction()
      .update(contratosTable)
      .set({
        occupationId: contrato.cargoId,
        unitId: contrato.unidadeId,
        registrationNumber: contrato.matricula,
        startDate: DateFormatter.format(contrato.dataInicio, "yyyy-MM-dd"),
        endDate: contrato.dataFim ? DateFormatter.format(contrato.dataFim, "yyyy-MM-dd") : null,
        status: this.mapStatusToDb(contrato.status),
      })
      .where(eq(contratosTable.id, contrato.id))
      .returning();

    if (!updated) {
      throw new Error("Falha ao atualizar contrato");
    }

    if (contrato instanceof ContratoProfessor) {
      const professor = contrato as ContratoProfessor;

      await this.drizzle
        .getTransaction()
        .delete(contratoProfessorDisciplinaTable)
        .where(eq(contratoProfessorDisciplinaTable.contractId, contrato.id));

      if (professor.disciplinas.length > 0) {
        await this.drizzle
          .getTransaction()
          .insert(contratoProfessorDisciplinaTable)
          .values(
            professor.disciplinas.map((d) => ({
              contractId: contrato.id,
              disciplineId: d.disciplinaId,
              etapaId: d.etapaId,
            }))
          );
      }

      return contrato;
    }

    return contrato;
  }

  async obterContratoAtivoColaborador(colaboradorId: number): Promise<Contrato | null> {
    const [contrato] = await this.drizzle
      .getTransaction()
      .select()
      .from(contratosTable)
      .where(and(eq(contratosTable.employeeId, colaboradorId), eq(contratosTable.status, "active")));

    if (!contrato) {
      return null;
    }

    const disciplinas = await this.drizzle
      .getTransaction()
      .select()
      .from(contratoProfessorDisciplinaTable)
      .where(eq(contratoProfessorDisciplinaTable.contractId, contrato.id));

    if (disciplinas.length > 0) {
      return ContratoProfessor.reconstituir({
        id: contrato.id,
        dataInicio: new Date(contrato.startDate),
        dataFim: contrato.endDate ? new Date(contrato.endDate) : null,
        cargoId: contrato.occupationId,
        unidadeId: contrato.unitId,
        matricula: contrato.registrationNumber!,
        salario: Number(contrato.salary),
        status: this.mapStatusFromDb(contrato.status!),
        disciplinas: disciplinas.map((d) => ({
          disciplinaId: d.disciplineId,
          etapaId: d.etapaId,
        })),
      });
    }

    return ContratoComum.reconstituir({
      id: contrato.id,
      dataInicio: new Date(contrato.startDate),
      dataFim: contrato.endDate ? new Date(contrato.endDate) : null,
      cargoId: contrato.occupationId,
      unidadeId: contrato.unitId,
      salario: Number(contrato.salary),
      matricula: contrato.registrationNumber!,
      status: this.mapStatusFromDb(contrato.status!),
    });
  }

  private mapStatusToDb(status: StatusContrato): "active" | "unactive" {
    return status === "ativo" ? "active" : "unactive";
  }

  private mapStatusFromDb(status: "active" | "unactive"): StatusContrato {
    return status === "active" ? StatusContratoEnum.Ativo : StatusContratoEnum.Inativo;
  }
}
