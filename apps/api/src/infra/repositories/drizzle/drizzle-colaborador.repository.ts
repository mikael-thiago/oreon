import { DateFormatter } from "@oreon/utils/date-formatter";
import { and, eq, sql } from "drizzle-orm";
import { Colaborador } from "../../../domain/entities/colaborador.entity.js";
import type { ColaboradorRepository } from "../../../domain/repositories/colaborador.repository.js";
import type { DrizzleService } from "./drizzle.service.js";
import { colaboradoresTable, contratosTable, pessoasTable, usuarioTable } from "./schema.js";

export class DrizzleColaboradorRepository implements ColaboradorRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async adicionar(colaborador: Colaborador): Promise<Colaborador> {
    const [pessoa] = await this.drizzle
      .getTransaction()
      .insert(pessoasTable)
      .values({
        name: colaborador.nome.getValor(),
        cpf: colaborador.cpf.getValor(),
        email: colaborador.email.getValor(),
        birthDate: DateFormatter.format(new Date(), "yyyy-MM-dd"),
        gender: "male",
        schoolId: colaborador.escolaId,
      })
      .returning();

    if (!pessoa) {
      throw new Error("Falha ao criar registro de pessoa");
    }

    const [employeeModel] = await this.drizzle
      .getTransaction()
      .insert(colaboradoresTable)
      .values({
        id: colaborador.id,
        personId: pessoa.id,
        userId: colaborador.usuario.id,
      })
      .returning();

    if (!employeeModel) {
      throw new Error("Falha ao criar colaborador");
    }

    return colaborador;
  }

  async obterProximoId(): Promise<number> {
    const res = await this.drizzle
      .getTransaction()
      .execute<{ readonly id: number }>(sql`SELECT NEXTVAL('employees_id_seq') AS "id"`);

    return res.rows[0]!.id;
  }

  async obterColaboradorPorId(id: number): Promise<Colaborador | null> {
    const [result] = await this.drizzle
      .getTransaction()
      .select({
        // Employee fields
        id: colaboradoresTable.id,
        nome: pessoasTable.name,
        cpf: pessoasTable.cpf,
        email: pessoasTable.email,
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
        usuarioEmail: usuarioTable.login,
        usuarioSenha: usuarioTable.password,
      })
      .from(colaboradoresTable)
      .innerJoin(pessoasTable, eq(colaboradoresTable.personId, pessoasTable.id))
      .innerJoin(usuarioTable, eq(colaboradoresTable.userId, usuarioTable.id))
      .innerJoin(contratosTable, and(eq(contratosTable.employeeId, colaboradoresTable.id)))
      .where(eq(colaboradoresTable.id, id));

    if (!result) {
      return null;
    }

    return Colaborador.reconstituir({
      id: result.id,
      nome: result.nome,
      cpf: result.cpf,
      email: result.email!,
      escolaId: result.unidadeId,
      usuario: {
        id: result.usuarioId,
        email: result.usuarioEmail,
      },
    });
  }

  async obterColaboradorPorCpf(cpf: string): Promise<Colaborador | null> {
    const [result] = await this.drizzle
      .getTransaction()
      .select({
        // Employee fields
        id: colaboradoresTable.id,
        nome: pessoasTable.name,
        cpf: pessoasTable.cpf,
        email: pessoasTable.email,
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
        usuarioEmail: usuarioTable.login,
        usuarioSenha: usuarioTable.password,
      })
      .from(colaboradoresTable)
      .innerJoin(pessoasTable, eq(colaboradoresTable.personId, pessoasTable.id))
      .innerJoin(usuarioTable, eq(colaboradoresTable.userId, usuarioTable.id))
      .innerJoin(
        contratosTable,
        and(eq(contratosTable.employeeId, colaboradoresTable.id), eq(contratosTable.status, "active"))
      )
      .where(eq(pessoasTable.cpf, cpf));

    if (!result) {
      return null;
    }

    return Colaborador.reconstituir({
      id: result.id,
      cpf: result.cpf,
      nome: result.nome,
      email: result.email!,
      escolaId: result.unidadeId,
      usuario: {
        id: result.usuarioId,
        email: result.usuarioEmail,
      },
    });
  }

  async obterColaboradorPorEmail(email: string): Promise<Colaborador | null> {
    const [result] = await this.drizzle
      .getTransaction()
      .select({
        // Employee fields
        id: colaboradoresTable.id,
        nome: pessoasTable.name,
        cpf: pessoasTable.cpf,
        email: pessoasTable.email,
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
        usuarioEmail: usuarioTable.login,
        usuarioSenha: usuarioTable.password,
      })
      .from(colaboradoresTable)
      .innerJoin(pessoasTable, eq(colaboradoresTable.personId, pessoasTable.id))
      .innerJoin(usuarioTable, eq(colaboradoresTable.userId, usuarioTable.id))
      .innerJoin(
        contratosTable,
        and(eq(contratosTable.employeeId, colaboradoresTable.id), eq(contratosTable.status, "active"))
      )
      .where(eq(pessoasTable.email, email));

    if (!result) {
      return null;
    }

    return Colaborador.reconstituir({
      id: result.id,
      nome: result.nome,
      cpf: result.cpf,
      email: result.email!,
      escolaId: result.unidadeId,
      usuario: {
        id: result.usuarioId,
        email: result.usuarioEmail,
      },
    });
  }

  async obterColaboradorPorUsuarioId(usuarioId: number): Promise<Colaborador | null> {
    const [result] = await this.drizzle
      .getTransaction()
      .select({
        // Employee fields
        id: colaboradoresTable.id,
        nome: pessoasTable.name,
        cpf: pessoasTable.cpf,
        email: pessoasTable.email,
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
        usuarioEmail: usuarioTable.login,
        usuarioSenha: usuarioTable.password,
      })
      .from(colaboradoresTable)
      .innerJoin(pessoasTable, eq(colaboradoresTable.personId, pessoasTable.id))
      .innerJoin(usuarioTable, eq(colaboradoresTable.userId, usuarioTable.id))
      .innerJoin(
        contratosTable,
        and(eq(contratosTable.employeeId, colaboradoresTable.id), eq(contratosTable.status, "active"))
      )
      .where(eq(colaboradoresTable.userId, usuarioId));

    if (!result) {
      return null;
    }

    return Colaborador.reconstituir({
      id: result.id,
      nome: result.nome,
      cpf: result.cpf,
      email: result.email!,
      escolaId: result.unidadeId,
      usuario: {
        id: result.usuarioId,
        email: result.usuarioEmail,
      },
    });
  }
}
