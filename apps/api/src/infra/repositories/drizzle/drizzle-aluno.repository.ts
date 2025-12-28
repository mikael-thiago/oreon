import { eq } from "drizzle-orm";
import { Aluno } from "../../../domain/entities/aluno.entity.js";
import type { Sexo } from "../../../domain/enums/sexo.enum.js";
import type { AlunoRepository, CriarAlunoRequest } from "../../../domain/repositories/aluno.repository.js";
import type { DrizzleService } from "./drizzle.service.js";
import { estudantesTable } from "./schema.js";
import { DateFormatter } from "@oreon/utils/date-formatter";
import { DateFormatEnum } from "@oreon/utils/date-format";

export class DrizzleAlunoRepository implements AlunoRepository {
  constructor(private readonly drizzleDb: DrizzleService) {}

  private mapSexoToDb(sexo: Sexo): "male" | "female" {
    return sexo === "masculino" ? "male" : "female";
  }

  private mapSexoFromDb(sex: "male" | "female"): Sexo {
    return sex === "male" ? "masculino" : "feminino";
  }

  async obterAlunoPorCpf(cpf: string): Promise<Aluno | null> {
    const [alunoModel] = await this.drizzleDb
      .getTransaction()
      .select()
      .from(estudantesTable)
      .where(eq(estudantesTable.cpf, cpf));

    if (!alunoModel) {
      return null;
    }

    return new Aluno({
      id: alunoModel.id,
      nome: alunoModel.name,
      cpf: alunoModel.cpf,
      dataDeNascimento: new Date(alunoModel.birthDate),
      sexo: this.mapSexoFromDb(alunoModel.sex),
    });
  }

  async obterAlunoPorId(id: number): Promise<Aluno | null> {
    const [alunoModel] = await this.drizzleDb
      .getTransaction()
      .select()
      .from(estudantesTable)
      .where(eq(estudantesTable.id, id));

    if (!alunoModel) {
      return null;
    }

    return new Aluno({
      id: alunoModel.id,
      nome: alunoModel.name,
      cpf: alunoModel.cpf,
      dataDeNascimento: new Date(alunoModel.birthDate),
      sexo: this.mapSexoFromDb(alunoModel.sex),
    });
  }

  async criarAluno(request: CriarAlunoRequest): Promise<Aluno> {
    const [alunoModel] = await this.drizzleDb
      .getTransaction()
      .insert(estudantesTable)
      .values({
        name: request.nome,
        cpf: request.cpf,
        birthDate: DateFormatter.format(request.dataDeNascimento, DateFormatEnum.ISO_DATE),
        sex: this.mapSexoToDb(request.sexo),
        userId: null,
      })
      .returning();

    if (!alunoModel) {
      throw new Error("Falha ao criar aluno");
    }

    return new Aluno({
      id: alunoModel.id,
      nome: alunoModel.name,
      cpf: alunoModel.cpf,
      dataDeNascimento: new Date(alunoModel.birthDate),
      sexo: this.mapSexoFromDb(alunoModel.sex),
    });
  }
}
