import { and, eq } from "drizzle-orm";
import { Colaborador } from "../../../domain/entities/colaborador.entity.js";
import { StatusContratoEnum } from "../../../domain/enums/status-contrato.enum.js";
import type {
  ColaboradorRepository,
  CriarColaboradorData,
  CriarProfessorRequest,
} from "../../../domain/repositories/colaborador.repository.js";
import { DateFormatter } from "../../utils/date-formatter.js";
import type { DrizzleService } from "./drizzle.service.js";
import { colaboradoresTable, contratoProfessorDisciplinaTable, contratosTable, usuarioTable } from "./schema.js";

export class DrizzleColaboradorRepository implements ColaboradorRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async obterColaboradorPorId(id: number): Promise<Colaborador | null> {
    const [result] = await this.drizzle
      .getTransaction()
      .select({
        // Employee fields
        id: colaboradoresTable.id,
        cpf: usuarioTable.cpf,
        email: usuarioTable.email,
        unidadeId: contratosTable.unitId,
        // Contract fields
        contratoId: contratosTable.id,
        dataInicio: contratosTable.startDate,
        dataFim: contratosTable.endDate,
        cargoId: contratosTable.occupationId,
        status: contratosTable.status,
        salario: contratosTable.salary,
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
      cpf: result.cpf!,
      email: result.email,
      unidadeId: result.unidadeId,
      ultimoContrato: {
        id: result.contratoId,
        dataInicio: new Date(result.dataInicio),
        dataFim: result.dataFim ? new Date(result.dataFim) : null,
        cargoId: result.cargoId,
        status: result.status === "active" ? StatusContratoEnum.Ativo : StatusContratoEnum.Inativo,
        salario: Number(result.salario),
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
        cpf: usuarioTable.cpf,
        email: usuarioTable.email,
        unidadeId: contratosTable.unitId,
        // Contract fields
        contratoId: contratosTable.id,
        dataInicio: contratosTable.startDate,
        dataFim: contratosTable.endDate,
        cargoId: contratosTable.occupationId,
        status: contratosTable.status,
        salario: contratosTable.salary,
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
      .where(eq(usuarioTable.cpf, cpf));

    if (!result) {
      return null;
    }

    return new Colaborador({
      id: result.id,
      cpf: result.cpf!,
      email: result.email,
      unidadeId: result.unidadeId,
      ultimoContrato: {
        id: result.contratoId,
        dataInicio: new Date(result.dataInicio),
        dataFim: result.dataFim ? new Date(result.dataFim) : null,
        cargoId: result.cargoId,
        status: result.status === "active" ? StatusContratoEnum.Ativo : StatusContratoEnum.Inativo,
        salario: Number(result.salario),
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
        cpf: usuarioTable.cpf,
        email: usuarioTable.email,
        unidadeId: contratosTable.unitId,
        // Contract fields
        contratoId: contratosTable.id,
        dataInicio: contratosTable.startDate,
        dataFim: contratosTable.endDate,
        cargoId: contratosTable.occupationId,
        status: contratosTable.status,
        salario: contratosTable.salary,
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
      .where(eq(usuarioTable.email, email));

    if (!result) {
      return null;
    }

    return new Colaborador({
      id: result.id,
      cpf: result.cpf!,
      email: result.email,
      unidadeId: result.unidadeId,
      ultimoContrato: {
        id: result.contratoId,
        dataInicio: new Date(result.dataInicio),
        dataFim: result.dataFim ? new Date(result.dataFim) : null,
        cargoId: result.cargoId,
        status: result.status === "active" ? StatusContratoEnum.Ativo : StatusContratoEnum.Inativo,
        salario: Number(result.salario),
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
        cpf: usuarioTable.cpf,
        email: usuarioTable.email,
        unidadeId: contratosTable.unitId,
        // Contract fields
        contratoId: contratosTable.id,
        dataInicio: contratosTable.startDate,
        dataFim: contratosTable.endDate,
        cargoId: contratosTable.occupationId,
        status: contratosTable.status,
        salario: contratosTable.salary,
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
      cpf: result.cpf!,
      email: result.email,
      unidadeId: result.unidadeId,
      ultimoContrato: {
        id: result.contratoId,
        dataInicio: new Date(result.dataInicio),
        dataFim: result.dataFim ? new Date(result.dataFim) : null,
        cargoId: result.cargoId,
        status: result.status === "active" ? StatusContratoEnum.Ativo : StatusContratoEnum.Inativo,
        salario: Number(result.salario),
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
    const [employeeModel] = await this.drizzle
      .getTransaction()
      .insert(colaboradoresTable)
      .values({
        userId: data.usuarioId,
      })
      .returning();

    if (!employeeModel) {
      throw new Error("Falha ao criar colaborador");
    }

    await this.drizzle
      .getTransaction()
      .update(usuarioTable)
      .set({
        cpf: data.cpf,
        email: data.email,
        phone: data.telefone,
      })
      .where(eq(usuarioTable.id, data.usuarioId));

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
        salary: String(data.salario),
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

  async criarProfessor(data: CriarProfessorRequest): Promise<Colaborador> {
    const colaborador = await this.criarColaborador(data);

    const values: { contractId: number; disciplineId: number; etapaId: number }[] = data.disciplinasPermitidas
      .map((disciplina) => disciplina.etapasIds.map((etapaId) => [disciplina.disciplinaId, etapaId] as const))
      .flat()
      .map(([disciplinaId, etapaId]) => ({
        contractId: colaborador.ultimoContrato.id,
        disciplineId: disciplinaId,
        etapaId: etapaId,
      }));

    await this.drizzle.getTransaction().insert(contratoProfessorDisciplinaTable).values(values);

    return colaborador;
  }
}
