import { desc, eq, sql } from "drizzle-orm";
import type { ColaboradorListItem, ColaboradoresQueries } from "../../application/queries/colaboradores.queries.js";
import { StatusContratoEnum } from "../../domain/enums/status-contrato.enum.js";
import type { DrizzleService } from "../repositories/drizzle/drizzle.service.js";
import {
  cargosTable,
  colaboradoresTable,
  contratosTable,
  escolaTable,
  unidadeTable,
  usuarioTable,
} from "../repositories/drizzle/schema.js";

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

    const latestContracts = latestContractSubquery.groupBy(contratosTable.employeeId).as("latest_contracts");

    // Main query to get colaboradores with their latest contract
    const queryBuilder = this.drizzle
      .getTransaction()
      .select({
        id: colaboradoresTable.id,
        nome: usuarioTable.name,
        email: usuarioTable.email,
        cpf: usuarioTable.cpf,
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
      .from(colaboradoresTable)
      .innerJoin(usuarioTable, eq(colaboradoresTable.userId, usuarioTable.id))
      .innerJoin(latestContracts, eq(colaboradoresTable.id, latestContracts.employeeId))
      .innerJoin(contratosTable, eq(contratosTable.id, latestContracts.maxId))
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
      cpf: result.cpf!,
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

  async obterDetalhesDoColaboradorPorId(id: number): Promise<any> {
    const results = await this.drizzle
      .getTransaction()
      .select({
        id: colaboradoresTable.id,
        nome: usuarioTable.name,
        email: usuarioTable.email,
        cpf: usuarioTable.cpf,
        telefone: usuarioTable.phone,
        contratoId: contratosTable.id,
        contratoDataInicio: contratosTable.startDate,
        contratoDataFim: contratosTable.endDate,
        contratoCargoId: cargosTable.id,
        contratoCargoNome: cargosTable.name,
        contratoMatricula: contratosTable.registrationNumber,
        contratoStatus: contratosTable.status,
        contratoSalario: contratosTable.salary,
      })
      .from(colaboradoresTable)
      .innerJoin(usuarioTable, eq(colaboradoresTable.userId, usuarioTable.id))
      .innerJoin(contratosTable, eq(contratosTable.employeeId, colaboradoresTable.id))
      .innerJoin(cargosTable, eq(contratosTable.occupationId, cargosTable.id))
      .where(eq(colaboradoresTable.id, id))
      .orderBy(desc(contratosTable.id));

    if (results.length === 0) {
      return null;
    }

    const firstResult = results[0]!;

    return {
      id: firstResult.id,
      nome: firstResult.nome,
      email: firstResult.email,
      cpf: firstResult.cpf || "",
      telefone: firstResult.telefone || "",
      contratos: results.map((result) => ({
        id: result.contratoId,
        dataInicio: result.contratoDataInicio,
        dataFim: result.contratoDataFim,
        cargoId: result.contratoCargoId,
        cargoNome: result.contratoCargoNome,
        matricula: result.contratoMatricula || "",
        status: result.contratoStatus === "active" ? StatusContratoEnum.Ativo : StatusContratoEnum.Inativo,
        salario: result.contratoSalario, // TODO: Add salary field to schema
      })),
    };
  }
}
