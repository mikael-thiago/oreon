import { eq } from "drizzle-orm";
import { Responsavel } from "../../../domain/entities/responsavel.entity.js";
import type { ResponsavelRepository, CriarResponsavelRequest } from "../../../domain/repositories/responsavel.repository.js";
import { DateFormatter } from "../../utils/date-formatter.js";
import type { DrizzleService } from "./drizzle.service.js";
import { responsaveisTable } from "./schema.js";

export class DrizzleResponsavelRepository implements ResponsavelRepository {
  constructor(private readonly drizzleDb: DrizzleService) {}

  async obterResponsavelPorCpf(cpf: string): Promise<Responsavel | null> {
    const [responsavelModel] = await this.drizzleDb
      .getTransaction()
      .select()
      .from(responsaveisTable)
      .where(eq(responsaveisTable.cpf, cpf));

    if (!responsavelModel) {
      return null;
    }

    return new Responsavel({
      id: responsavelModel.id,
      nome: responsavelModel.name,
      cpf: responsavelModel.cpf,
      telefone: responsavelModel.phone,
      email: responsavelModel.email,
      dataDeNascimento: new Date(responsavelModel.birthDate),
    });
  }

  async obterResponsavelPorId(id: number): Promise<Responsavel | null> {
    const [responsavelModel] = await this.drizzleDb
      .getTransaction()
      .select()
      .from(responsaveisTable)
      .where(eq(responsaveisTable.id, id));

    if (!responsavelModel) {
      return null;
    }

    return new Responsavel({
      id: responsavelModel.id,
      nome: responsavelModel.name,
      cpf: responsavelModel.cpf,
      telefone: responsavelModel.phone,
      email: responsavelModel.email,
      dataDeNascimento: new Date(responsavelModel.birthDate),
    });
  }

  async criarResponsavel(request: CriarResponsavelRequest): Promise<Responsavel> {
    const [responsavelModel] = await this.drizzleDb
      .getTransaction()
      .insert(responsaveisTable)
      .values({
        name: request.nome,
        cpf: request.cpf,
        phone: request.telefone,
        email: request.email,
        birthDate: DateFormatter.format(request.dataDeNascimento, "YYYY-MM-DD"),
        userId: null,
      })
      .returning();

    if (!responsavelModel) {
      throw new Error("Falha ao criar responsável");
    }

    return new Responsavel({
      id: responsavelModel.id,
      nome: responsavelModel.name,
      cpf: responsavelModel.cpf,
      telefone: responsavelModel.phone,
      email: responsavelModel.email,
      dataDeNascimento: new Date(responsavelModel.birthDate),
    });
  }
}
