import { eq, sql } from "drizzle-orm";
import { Usuario } from "../../../domain/entities/usuario.entity.js";
import type { UsuarioRepository } from "../../../domain/repositories/usuario.repository.js";
import type { DrizzleService } from "./drizzle.service.js";
import { usuarioTable } from "./schema.js";

export class DrizzleUsuarioRepository implements UsuarioRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async obterProximoId(): Promise<number> {
    const res = await this.drizzle
      .getTransaction()
      .execute<{ readonly id: number }>(sql`SELECT NEXTVAL('users_id_seq') AS "id"`);

    return res.rows[0]!.id;
  }

  async obterUsuarioPorId(id: number): Promise<Usuario | null> {
    const [usuarioModel] = await this.drizzle
      .getTransaction()
      .select()
      .from(usuarioTable)
      .where(eq(usuarioTable.id, id));

    if (!usuarioModel) {
      return null;
    }

    return new Usuario({
      id: usuarioModel.id,
      nome: usuarioModel.name,
      login: usuarioModel.login,
      senha: usuarioModel.password,
      escolaId: usuarioModel.schoolId!,
      admin: usuarioModel.isAdmin,
      root: usuarioModel.isRoot,
    });
  }

  async obterUsuarioPorEmail(login: string): Promise<Usuario | null> {
    const [usuarioModel] = await this.drizzle
      .getTransaction()
      .select()
      .from(usuarioTable)
      .where(eq(usuarioTable.login, login));

    if (!usuarioModel) {
      return null;
    }

    return new Usuario({
      id: usuarioModel.id,
      nome: usuarioModel.name,
      login: usuarioModel.login,
      senha: usuarioModel.password,
      escolaId: usuarioModel.schoolId!,
      admin: usuarioModel.isAdmin,
      root: usuarioModel.isRoot,
    });
  }

  async salvar(usuario: Usuario): Promise<Usuario> {
    const [usuarioModel] = await this.drizzle
      .getTransaction()
      .insert(usuarioTable)
      .values({
        id: usuario.id,
        name: usuario.nome,
        login: usuario.login,
        password: usuario.senha,
        schoolId: usuario.escolaId,
        isAdmin: usuario.admin,
        isRoot: usuario.root,
      })
      .returning({ id: usuarioTable.id });

    if (!usuarioModel) {
      throw new Error("Falha ao criar usuário");
    }

    return usuario;
  }
}
