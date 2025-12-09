import { count, eq } from "drizzle-orm";
import { Escola } from "../../../domain/entities/Escola.js";
import type { EscolaRepository } from "../../../domain/repositories/EscolaRepository.js";
import type { DrizzleService } from "./DrizzleService.js";
import { escolaTable, unidadeTable } from "./schema.js";

export class DrizzleEscolaRepository implements EscolaRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async existeComEmail(email: string): Promise<boolean> {
    const [res] = await this.drizzle
      .getTransaction()
      .select({ count: count() })
      .from(escolaTable)
      .where(eq(escolaTable.email, email));

    return !res || res.count > 0;
  }

  async existe(id: number): Promise<boolean> {
    const [res] = await this.drizzle
      .getTransaction()
      .select({ count: count() })
      .from(escolaTable)
      .where(eq(escolaTable.id, id));

    return !res || res.count > 0;
  }

  async criarEscola(request: {
    readonly nome: string;
    readonly email: string;
    readonly cnpjMatriz: string;
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
    const [escolaModel] = await this.drizzle
      .getTransaction()
      .insert(escolaTable)
      .values({
        name: request.nome,
        email: request.email,
      })
      .returning({
        id: escolaTable.id,
        createdAt: escolaTable.createdAt,
      });

    const [unidadeModel] = await this.drizzle
      .getTransaction()
      .insert(unidadeTable)
      .values({
        cnpj: request.cnpjMatriz,
        phone1: request.telefone1,
        phone2: request.telefone2,
        street: request.endereco?.rua,
        number: request.endereco?.numero,
        city: request.endereco?.cidade,
        state: request.endereco?.estado,
        zipCode: request.endereco?.cep,
        country: request.endereco?.pais,
        institutionId: escolaModel!.id,
        isHeadQuarter: true,
      })
      .returning({
        id: unidadeTable.id,
        createdAt: unidadeTable.createdAt,
      });

    return new Escola({
      id: escolaModel!.id,
      nome: request.nome,
      email: request.email,
      dataDeCriacao: escolaModel!.createdAt,
      matriz: {
        id: unidadeModel!.id,
        email: request.email,
        escolaId: escolaModel!.id,
        nome: request.nome,
        cnpj: request.cnpjMatriz,
        telefone1: request.telefone1,
        telefone2: request.telefone2 ?? null,
        endereco: {
          rua: request.endereco?.rua ?? null,
          numero: request.endereco?.numero ?? null,
          cidade: request.endereco?.cidade ?? null,
          estado: request.endereco?.estado ?? null,
          cep: request.endereco?.cep ?? null,
          pais: request.endereco?.pais ?? null,
        },
        dataDeCriacao: unidadeModel!.createdAt,
      },
    });
  }
}
