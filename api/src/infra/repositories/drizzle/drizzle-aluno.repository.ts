import { eq } from "drizzle-orm";
import { Aluno } from "../../../domain/entities/aluno.entity.js";
import type { AlunoRepository, CriarAlunoRequest } from "../../../domain/repositories/aluno.repository.js";
import { DateFormatter } from "../../utils/date-formatter.js";
import type { DrizzleService } from "./drizzle.service.js";
import { estudantesTable } from "./schema.js";

export class DrizzleAlunoRepository implements AlunoRepository {
  constructor(private readonly drizzleDb: DrizzleService) {}

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
    });
  }

  async criarAluno(request: CriarAlunoRequest): Promise<Aluno> {
    const [alunoModel] = await this.drizzleDb
      .getTransaction()
      .insert(estudantesTable)
      .values({
        name: request.nome,
        cpf: request.cpf,
        birthDate: DateFormatter.format(request.dataDeNascimento, "YYYY-MM-DD"),
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
    });
  }
}
