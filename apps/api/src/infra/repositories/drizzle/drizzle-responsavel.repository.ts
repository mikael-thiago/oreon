import { DateFormatEnum } from "@oreon/utils/date-format";
import { DateFormatter } from "@oreon/utils/date-formatter";
import { eq, sql } from "drizzle-orm";
import { Responsavel } from "../../../domain/entities/responsavel.entity.js";
import type { ResponsavelRepository } from "../../../domain/repositories/responsavel.repository.js";
import type { DrizzleService } from "./drizzle.service.js";
import { pessoasTable } from "./schema.js";

export class DrizzleResponsavelRepository implements ResponsavelRepository {
  constructor(private readonly drizzleDb: DrizzleService) {}

  async obterProximoId(): Promise<number> {
    const res = await this.drizzleDb
      .getTransaction()
      .execute<{ readonly id: number }>(sql`SELECT NEXTVAL('persons_id_seq') AS "id"`);

    return res.rows[0]!.id;
  }

  async obterResponsavelPorCpf(cpf: string): Promise<Responsavel | null> {
    const [responsavelModel] = await this.drizzleDb
      .getTransaction()
      .select({
        id: pessoasTable.id,
        nome: pessoasTable.name,
        cpf: pessoasTable.cpf,
        dataDeNascimento: pessoasTable.birthDate,
        email: pessoasTable.email,
        telefone: pessoasTable.phone,
        escolaId: pessoasTable.schoolId,
      })
      .from(pessoasTable)
      .where(eq(pessoasTable.cpf, cpf));

    if (!responsavelModel) {
      return null;
    }

    return Responsavel.reconstituir({
      id: responsavelModel.id,
      nome: responsavelModel.nome,
      cpf: responsavelModel.cpf,
      telefone: responsavelModel.telefone!,
      email: responsavelModel.email!,
      dataDeNascimento: new Date(responsavelModel.dataDeNascimento),
      escolaId: responsavelModel.escolaId,
    });
  }

  async obterResponsavelPorId(id: number): Promise<Responsavel | null> {
    const [responsavelModel] = await this.drizzleDb
      .getTransaction()
      .select({
        id: pessoasTable.id,
        nome: pessoasTable.name,
        cpf: pessoasTable.cpf,
        dataDeNascimento: pessoasTable.birthDate,
        email: pessoasTable.email,
        telefone: pessoasTable.phone,
        escolaId: pessoasTable.schoolId,
      })
      .from(pessoasTable)
      .where(eq(pessoasTable.id, id));

    if (!responsavelModel) {
      return null;
    }

    return Responsavel.reconstituir({
      id: responsavelModel.id,
      nome: responsavelModel.nome,
      cpf: responsavelModel.cpf,
      telefone: responsavelModel.telefone!,
      email: responsavelModel.email!,
      dataDeNascimento: new Date(responsavelModel.dataDeNascimento),
      escolaId: responsavelModel.escolaId,
    });
  }

  async salvar(responsavel: Responsavel): Promise<Responsavel> {
    const [pessoa] = await this.drizzleDb
      .getTransaction()
      .insert(pessoasTable)
      .values({
        id: responsavel.id,
        name: responsavel.nome.getValor(),
        cpf: responsavel.cpf.getValor(),
        email: responsavel.email.getValor(),
        phone: responsavel.telefone.getValor(),
        birthDate: DateFormatter.format(responsavel.dataDeNascimento, DateFormatEnum.ISO_DATE),
        gender: "male",
        schoolId: responsavel.escolaId,
      })
      .returning({ id: pessoasTable.id });

    if (!pessoa) {
      throw new Error("Falha ao criar registro de pessoa");
    }

    return responsavel;
  }
}
