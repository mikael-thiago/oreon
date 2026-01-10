import { and, eq, isNull, or, sql } from "drizzle-orm";
import { Disciplina } from "../../../domain/entities/disciplina.entity.js";
import type {
  DisciplinaRepository,
  ObterOuCriarDisciplinaRequest,
} from "../../../domain/repositories/disciplina.repository.js";
import { slugify } from "@oreon/utils/string";
import type { DrizzleService } from "./drizzle.service.js";
import { disciplinasTable } from "./schema.js";

export class DrizzleDisciplinaRepository implements DisciplinaRepository {
  constructor(private readonly drizzleUow: DrizzleService) {}

  async obterProximoId(): Promise<number> {
    const res = await this.drizzleUow
      .getTransaction()
      .execute<{ readonly id: number }>(sql`SELECT NEXTVAL('disciplines_id_seq') AS "id"`);

    return res.rows[0]!.id;
  }

  async obterOuCriarNaEscola(request: ObterOuCriarDisciplinaRequest): Promise<Disciplina> {
    const slug = slugify(request.nome);

    const [existente] = await this.drizzleUow
      .getTransaction()
      .select()
      .from(disciplinasTable)
      .where(
        and(
          eq(disciplinasTable.slug, slug),
          or(isNull(disciplinasTable.unitId), eq(disciplinasTable.unitId, request.unidadeId))
        )
      )
      .limit(1);

    if (existente) {
      return new Disciplina({
        id: existente.id,
        nome: existente.name,
        slug: existente.slug,
        unidadeId: existente.unitId,
      });
    }

    const [novaDisciplina] = await this.drizzleUow
      .getTransaction()
      .insert(disciplinasTable)
      .values({
        name: request.nome,
        slug,
        unitId: request.unidadeId,
      })
      .returning();

    return new Disciplina({
      id: novaDisciplina!.id,
      nome: novaDisciplina!.name,
      slug: novaDisciplina!.slug,
    });
  }
}
