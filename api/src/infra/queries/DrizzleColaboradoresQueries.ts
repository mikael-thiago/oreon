import { desc, eq, sql } from "drizzle-orm";
import type { ColaboradorListItem, ColaboradoresQueries } from "../../application/queries/ColaboradoresQueries.js";
import type { DrizzleService } from "../repositories/drizzle/DrizzleService.js";
import {
  cargosTable,
  contratosTable,
  employeesTable,
  escolaTable,
  unidadeTable,
  usuarioTable,
} from "../repositories/drizzle/schema.js";
import { StatusContratoEnum } from "../../domain/enums/StatusContratoEnum.js";

export class DrizzleColaboradoresQueries implements ColaboradoresQueries {
  constructor(private readonly drizzle: DrizzleService) {}

  async listarColaboradores(escolaId: number, unidadeId?: number): Promise<ColaboradorListItem[]> {
    // Subquery to get the latest contract ID for each employee at the specified unit (or all units)
    const latestContractSubquery = this.drizzle
      .getTransaction()
      .select({
        employeeId: contratosTable.employeeId,
        maxId: sql<number>`MAX(${contratosTable.id})`.as("max_id"),
      })
      .from(contratosTable)
      .$dynamic();

    if (unidadeId) {
      latestContractSubquery.where(eq(contratosTable.unitId, unidadeId));
    }

    const latestContracts = latestContractSubquery
      .groupBy(contratosTable.employeeId)
      .as("latest_contracts");

    // Main query to get colaboradores with their latest contract
    const queryBuilder = this.drizzle
      .getTransaction()
      .select({
        id: employeesTable.id,
        nome: usuarioTable.name,
        email: employeesTable.email,
        cpf: employeesTable.cpf,
        telefone: usuarioTable.phone,
        unidadeId: unidadeTable.id,
        unidadeCnpj: unidadeTable.cnpj,
        escolaNome: escolaTable.name,
        cargoNome: cargosTable.name,
        contratoId: contratosTable.id,
        dataInicio: contratosTable.startDate,
        dataFim: contratosTable.endDate,
        status: contratosTable.status,
      })
      .from(employeesTable)
      .innerJoin(usuarioTable, eq(employeesTable.userId, usuarioTable.id))
      .innerJoin(
        latestContracts,
        eq(employeesTable.id, latestContracts.employeeId)
      )
      .innerJoin(
        contratosTable,
        eq(contratosTable.id, latestContracts.maxId)
      )
      .innerJoin(unidadeTable, eq(contratosTable.unitId, unidadeTable.id))
      .innerJoin(escolaTable, eq(unidadeTable.institutionId, escolaTable.id))
      .innerJoin(cargosTable, eq(contratosTable.occupationId, cargosTable.id))
      .where(eq(usuarioTable.escolaId, escolaId))
      .orderBy(desc(contratosTable.id));

    const results = await queryBuilder;

    return results.map((result) => ({
      id: result.id,
      nome: result.nome,
      email: result.email,
      cpf: result.cpf,
      telefone: result.telefone || "",
      unidade: {
        id: result.unidadeId,
        cnpj: result.unidadeCnpj,
        nome: result.escolaNome,
      },
      contrato: {
        id: result.contratoId,
        cargo: result.cargoNome,
        dataFim: result.dataFim,
        dataInicio: result.dataInicio,
        status: result.status === "active" ? StatusContratoEnum.Ativo : StatusContratoEnum.Inativo,
      },
    }));
  }
}
