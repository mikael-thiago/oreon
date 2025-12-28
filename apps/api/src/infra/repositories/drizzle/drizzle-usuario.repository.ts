import { eq } from "drizzle-orm";
import { Usuario } from "../../../domain/entities/usuario.entity.js";
import type { CriarUsuarioData, UsuarioRepository } from "../../../domain/repositories/usuario.repository.js";
import type { DrizzleService } from "./drizzle.service.js";
import { usuarioTable } from "./schema.js";

export class DrizzleUsuarioRepository implements UsuarioRepository {
  constructor(private readonly drizzle: DrizzleService) {}

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
      escolaId: usuarioModel.escolaId!,
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
      escolaId: usuarioModel.escolaId!,
      admin: usuarioModel.isAdmin,
      root: usuarioModel.isRoot,
    });
  }

  async criarUsuario(data: CriarUsuarioData): Promise<Usuario> {
    const [usuarioModel] = await this.drizzle
      .getTransaction()
      .insert(usuarioTable)
      .values({
        name: data.nome,
        login: data.login,
        password: data.senha,
        escolaId: data.escolaId,
        isRoot: data.root,
      })
      .returning();

    if (!usuarioModel) {
      throw new Error("Falha ao criar usuário");
    }

    return new Usuario({
      id: usuarioModel.id,
      nome: usuarioModel.name,
      login: usuarioModel.login,
      senha: usuarioModel.password,
      escolaId: usuarioModel.escolaId!,
      admin: usuarioModel.isAdmin,
      root: usuarioModel.isRoot,
    });
  }
}
