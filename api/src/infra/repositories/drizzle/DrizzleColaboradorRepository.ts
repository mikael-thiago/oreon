import { eq, and } from "drizzle-orm";
import { Colaborador } from "../../../domain/entities/Colaborador.js";
import type {
  ColaboradorRepository,
  CriarColaboradorData,
} from "../../../domain/repositories/ColaboradorRepository.js";
import type { DrizzleService } from "./DrizzleService.js";
import { colaboradoresTable, usuarioTable, contratosTable } from "./schema.js";
import { DateFormatter } from "../../utils/date-formatter.js";
import { StatusContratoEnum } from "../../../domain/enums/StatusContratoEnum.js";

export class DrizzleColaboradorRepository implements ColaboradorRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async obterColaboradorPorId(id: number): Promise<Colaborador | null> {
    const [result] = await this.drizzle
      .getTransaction()
      .select({
        // Employee fields
        id: colaboradoresTable.id,
        cpf: colaboradoresTable.cpf,
        email: colaboradoresTable.email,
        unidadeId: contratosTable.unitId,
        // Contract fields
        contratoId: contratosTable.id,
        dataInicio: contratosTable.startDate,
        dataFim: contratosTable.endDate,
        cargoId: contratosTable.occupationId,
        status: contratosTable.status,
        // User fields
        usuarioId: usuarioTable.id,
        usuarioNome: usuarioTable.name,
        usuarioEmail: usuarioTable.email,
        usuarioSenha: usuarioTable.password,
      })
      .from(colaboradoresTable)
      .innerJoin(usuarioTable, eq(colaboradoresTable.userId, usuarioTable.id))
      .innerJoin(contratosTable, and(eq(contratosTable.employeeId, colaboradoresTable.id)))
      .where(eq(colaboradoresTable.id, id));

    if (!result) {
      return null;
    }

    return new Colaborador({
      id: result.id,
      cpf: result.cpf,
      email: result.email,
      unidadeId: result.unidadeId,
      ultimoContrato: {
        id: result.contratoId,
        dataInicio: new Date(result.dataInicio),
        dataFim: result.dataFim ? new Date(result.dataFim) : null,
        cargoId: result.cargoId,
        status: result.status === 'active' ? StatusContratoEnum.Ativo : StatusContratoEnum.Inativo
      },
      usuario: {
        id: result.usuarioId,
        nome: result.usuarioNome,
        email: result.usuarioEmail,
        senha: result.usuarioSenha,
      },
    });
  }

  async obterColaboradorPorCpf(cpf: string): Promise<Colaborador | null> {
    const [result] = await this.drizzle
      .getTransaction()
      .select({
        // Employee fields
        id: colaboradoresTable.id,
        cpf: colaboradoresTable.cpf,
        email: colaboradoresTable.email,
        unidadeId: contratosTable.unitId,
        // Contract fields
        contratoId: contratosTable.id,
        dataInicio: contratosTable.startDate,
        dataFim: contratosTable.endDate,
        cargoId: contratosTable.occupationId,
        status: contratosTable.status,
        // User fields
        usuarioId: usuarioTable.id,
        usuarioNome: usuarioTable.name,
        usuarioEmail: usuarioTable.email,
        usuarioSenha: usuarioTable.password,
      })
      .from(colaboradoresTable)
      .innerJoin(usuarioTable, eq(colaboradoresTable.userId, usuarioTable.id))
      .innerJoin(
        contratosTable,
        and(eq(contratosTable.employeeId, colaboradoresTable.id), eq(contratosTable.status, "active"))
      )
      .where(eq(colaboradoresTable.cpf, cpf));

    if (!result) {
      return null;
    }

    return new Colaborador({
      id: result.id,
      cpf: result.cpf,
      email: result.email,
      unidadeId: result.unidadeId,
      ultimoContrato: {
        id: result.contratoId,
        dataInicio: new Date(result.dataInicio),
        dataFim: result.dataFim ? new Date(result.dataFim) : null,
        cargoId: result.cargoId,
        status: result.status === 'active' ? StatusContratoEnum.Ativo : StatusContratoEnum.Inativo
      },
      usuario: {
        id: result.usuarioId,
        nome: result.usuarioNome,
        email: result.usuarioEmail,
        senha: result.usuarioSenha,
      },
    });
  }

  async obterColaboradorPorEmail(email: string): Promise<Colaborador | null> {
    const [result] = await this.drizzle
      .getTransaction()
      .select({
        // Employee fields
        id: colaboradoresTable.id,
        cpf: colaboradoresTable.cpf,
        email: colaboradoresTable.email,
        unidadeId: contratosTable.unitId,
        // Contract fields
        contratoId: contratosTable.id,
        dataInicio: contratosTable.startDate,
        dataFim: contratosTable.endDate,
        cargoId: contratosTable.occupationId,
        status: contratosTable.status,
        // User fields
        usuarioId: usuarioTable.id,
        usuarioNome: usuarioTable.name,
        usuarioEmail: usuarioTable.email,
        usuarioSenha: usuarioTable.password,
      })
      .from(colaboradoresTable)
      .innerJoin(usuarioTable, eq(colaboradoresTable.userId, usuarioTable.id))
      .innerJoin(
        contratosTable,
        and(eq(contratosTable.employeeId, colaboradoresTable.id), eq(contratosTable.status, "active"))
      )
      .where(eq(colaboradoresTable.email, email));

    if (!result) {
      return null;
    }

    return new Colaborador({
      id: result.id,
      cpf: result.cpf,
      email: result.email,
      unidadeId: result.unidadeId,
      ultimoContrato: {
        id: result.contratoId,
        dataInicio: new Date(result.dataInicio),
        dataFim: result.dataFim ? new Date(result.dataFim) : null,
        cargoId: result.cargoId,
        status: result.status === 'active' ? StatusContratoEnum.Ativo : StatusContratoEnum.Inativo
      },
      usuario: {
        id: result.usuarioId,
        nome: result.usuarioNome,
        email: result.usuarioEmail,
        senha: result.usuarioSenha,
      },
    });
  }

  async obterColaboradorPorUsuarioId(usuarioId: number): Promise<Colaborador | null> {
    const [result] = await this.drizzle
      .getTransaction()
      .select({
        // Employee fields
        id: colaboradoresTable.id,
        cpf: colaboradoresTable.cpf,
        email: colaboradoresTable.email,
        unidadeId: contratosTable.unitId,
        // Contract fields
        contratoId: contratosTable.id,
        dataInicio: contratosTable.startDate,
        dataFim: contratosTable.endDate,
        cargoId: contratosTable.occupationId,
        status: contratosTable.status,
        // User fields
        usuarioId: usuarioTable.id,
        usuarioNome: usuarioTable.name,
        usuarioEmail: usuarioTable.email,
        usuarioSenha: usuarioTable.password,
      })
      .from(colaboradoresTable)
      .innerJoin(usuarioTable, eq(colaboradoresTable.userId, usuarioTable.id))
      .innerJoin(
        contratosTable,
        and(eq(contratosTable.employeeId, colaboradoresTable.id), eq(contratosTable.status, "active"))
      )
      .where(eq(colaboradoresTable.userId, usuarioId));

    if (!result) {
      return null;
    }

    return new Colaborador({
      id: result.id,
      cpf: result.cpf,
      email: result.email,
      unidadeId: result.unidadeId,
      ultimoContrato: {
        id: result.contratoId,
        dataInicio: new Date(result.dataInicio),
        dataFim: result.dataFim ? new Date(result.dataFim) : null,
        cargoId: result.cargoId,
        status: result.status === 'active' ? StatusContratoEnum.Ativo : StatusContratoEnum.Inativo
      },
      usuario: {
        id: result.usuarioId,
        nome: result.usuarioNome,
        email: result.usuarioEmail,
        senha: result.usuarioSenha,
      },
    });
  }

  async criarColaborador(data: CriarColaboradorData): Promise<Colaborador> {
    // Step 1: Create employee record
    const [employeeModel] = await this.drizzle
      .getTransaction()
      .insert(colaboradoresTable)
      .values({
        cpf: data.cpf,
        email: data.email,
        userId: data.usuarioId,
      })
      .returning();

    if (!employeeModel) {
      throw new Error("Falha ao criar colaborador");
    }

    // Step 2: Create contract record
    const [contractModel] = await this.drizzle
      .getTransaction()
      .insert(contratosTable)
      .values({
        employeeId: employeeModel.id,
        occupationId: data.cargoId,
        unitId: data.unidadeId,
        registrationNumber: data.numeroMatricula,
        startDate: DateFormatter.format(data.dataInicio, "YYYY-MM-DD"),
        endDate: data.dataFim ? DateFormatter.format(data.dataFim, "YYYY-MM-DD") : null,
        status: "unactive",
      })
      .returning({ id: contratosTable.id });

    if (!contractModel) {
      throw new Error("Falha ao criar contrato do colaborador");
    }

    const colaborador = await this.obterColaboradorPorId(employeeModel.id);

    if (!colaborador) {
      throw new Error("Colaborador criado mas não foi possível obter os dados completos");
    }

    return colaborador;
  }
}
