import { count, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Escola } from "../../../domain/entities/Escola.js";
import type { EscolaRepository } from "../../../domain/repositories/EscolaRepository.js";
import { escolaTable } from "./schema.js";

export class DrizzleEscolaRepository implements EscolaRepository {
  constructor(private readonly drizzleDb: ReturnType<typeof drizzle>) {}

  async existeComEmail(email: string): Promise<boolean> {
    const [res] = await this.drizzleDb
      .select({ count: count() })
      .from(escolaTable)
      .where(eq(escolaTable.email, email));

    return !res || res.count > 0;
  }

  async existe(id: number): Promise<boolean> {
    const [res] = await this.drizzleDb
      .select({ count: count() })
      .from(escolaTable)
      .where(eq(escolaTable.id, id));

    return !res || res.count > 0;
  }

  async criarEscola(request: {
    readonly nome: string;
    readonly email: string;
    readonly telefone1: string;
    readonly telefone2?: string | undefined;
    readonly endereco?: {
      readonly rua?: string | undefined;
      readonly numero?: string | undefined;
      readonly cidade?: string | undefined;
      readonly estado?: string | undefined;
      readonly cep?: string | undefined;
      readonly pais?: string | undefined;
    };
  }): Promise<Escola> {
    const [escolaModel] = await this.drizzleDb
      .insert(escolaTable)
      .values({
        name: request.nome,
        email: request.email,
        phone1: request.telefone1,
        phone2: request.telefone2,
        street: request.endereco?.rua,
        number: request.endereco?.numero,
        city: request.endereco?.cidade,
        state: request.endereco?.estado,
        zipCode: request.endereco?.cep,
        country: request.endereco?.pais,
      })
      .returning({
        id: escolaTable.id,
        createdAt: escolaTable.createdAt,
      });

    return new Escola({
      id: escolaModel!.id,
      nome: request.nome,
      email: request.email,
      telefone1: request.telefone1,
      telefone2: request.telefone2 ?? undefined,
      endereco: request.endereco,
      dataDeCriacao: escolaModel!.createdAt,
    });
  }
}
