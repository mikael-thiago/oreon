import { eq, sql } from "drizzle-orm";
import { Aluno } from "../../../domain/entities/aluno.entity.js";
import { SexoEnum, type Sexo } from "../../../domain/enums/sexo.enum.js";
import type { AlunoRepository } from "../../../domain/repositories/aluno.repository.js";
import type { DrizzleService } from "./drizzle.service.js";
import { estudantesTable, pessoasTable } from "./schema.js";
import { DateFormatter } from "@oreon/utils/date-formatter";
import { DateFormatEnum } from "@oreon/utils/date-format";

export class DrizzleAlunoRepository implements AlunoRepository {
  constructor(private readonly drizzleDb: DrizzleService) {}

  async obterProximoId(): Promise<number> {
    const res = await this.drizzleDb
      .getTransaction()
      .execute<{ readonly id: number }>(sql`SELECT NEXTVAL('persons_id_seq') AS "id"`);

    return res.rows[0]!.id;
  }

  private mapSexoToDb(sexo: Sexo): "male" | "female" {
    return sexo === "masculino" ? "male" : "female";
  }

  private mapGeneroFromDb(gender: "male" | "female" | null): Sexo | null {
    if (!gender) return null;
    if (gender === "male") return SexoEnum.Masculino;
    return SexoEnum.Feminino;
  }

  async obterAlunoPorCpf(cpf: string): Promise<Aluno | null> {
    const [alunoModel] = await this.drizzleDb
      .getTransaction()
      .select({
        id: estudantesTable.id,
        personId: estudantesTable.personId,
        nome: pessoasTable.name,
        cpf: pessoasTable.cpf,
        dataDeNascimento: pessoasTable.birthDate,
        sexo: pessoasTable.gender,
        escolaId: pessoasTable.schoolId,
      })
      .from(estudantesTable)
      .innerJoin(pessoasTable, eq(estudantesTable.personId, pessoasTable.id))
      .where(eq(pessoasTable.cpf, cpf));

    if (!alunoModel) {
      return null;
    }

    return Aluno.reconstituir({
      id: alunoModel.id,
      nome: alunoModel.nome,
      cpf: alunoModel.cpf,
      dataDeNascimento: new Date(alunoModel.dataDeNascimento),
      sexo: this.mapGeneroFromDb(alunoModel.sexo),
      escolaId: alunoModel.escolaId,
    });
  }

  async obterAlunoPorId(id: number): Promise<Aluno | null> {
    const [alunoModel] = await this.drizzleDb
      .getTransaction()
      .select({
        id: estudantesTable.id,
        personId: estudantesTable.personId,
        nome: pessoasTable.name,
        cpf: pessoasTable.cpf,
        dataDeNascimento: pessoasTable.birthDate,
        sexo: pessoasTable.gender,
        escolaId: pessoasTable.schoolId,
      })
      .from(estudantesTable)
      .innerJoin(pessoasTable, eq(estudantesTable.personId, pessoasTable.id))
      .where(eq(estudantesTable.id, id));

    if (!alunoModel) {
      return null;
    }

    return Aluno.reconstituir({
      id: alunoModel.id,
      nome: alunoModel.nome,
      cpf: alunoModel.cpf,
      dataDeNascimento: new Date(alunoModel.dataDeNascimento),
      sexo: this.mapGeneroFromDb(alunoModel.sexo),
      escolaId: alunoModel.escolaId,
    });
  }

  async salvar(aluno: Aluno): Promise<Aluno> {
    const [pessoa] = await this.drizzleDb
      .getTransaction()
      .insert(pessoasTable)
      .values({
        id: aluno.id,
        name: aluno.nomeCompleto,
        cpf: aluno.cpfValor,
        birthDate: DateFormatter.format(aluno.dataDeNascimento, DateFormatEnum.ISO_DATE),
        gender: aluno.sexo ? this.mapSexoToDb(aluno.sexo) : "male",
        schoolId: aluno.escolaId,
      })
      .returning();

    if (!pessoa) {
      throw new Error("Falha ao criar registro de pessoa");
    }

    const [alunoModel] = await this.drizzleDb
      .getTransaction()
      .insert(estudantesTable)
      .values({
        personId: pessoa.id,
      })
      .returning();

    if (!alunoModel) {
      throw new Error("Falha ao criar aluno");
    }

    return Aluno.reconstituir({
      id: alunoModel.id,
      nome: aluno.nomeCompleto,
      cpf: aluno.cpfValor,
      dataDeNascimento: aluno.dataDeNascimento,
      sexo: aluno.sexo,
      escolaId: aluno.escolaId,
    });
  }
}
