import { eq } from "drizzle-orm";
import { Usuario } from "../../../domain/entities/Usuario.js";
import type { CriarUsuarioData, UsuarioRepository } from "../../../domain/repositories/UsuarioRepository.js";
import type { DrizzleService } from "./DrizzleService.js";
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
      email: usuarioModel.email,
      senha: usuarioModel.password,
      telefone: usuarioModel.phone ?? undefined,
      escolaId: usuarioModel.escolaId!,
      admin: usuarioModel.isAdmin,
      root: usuarioModel.isRoot,
    });
  }

  async obterUsuarioPorEmail(email: string): Promise<Usuario | null> {
    const [usuarioModel] = await this.drizzle
      .getTransaction()
      .select()
      .from(usuarioTable)
      .where(eq(usuarioTable.email, email));

    if (!usuarioModel) {
      return null;
    }

    return new Usuario({
      id: usuarioModel.id,
      nome: usuarioModel.name,
      email: usuarioModel.email,
      senha: usuarioModel.password,
      telefone: usuarioModel.phone ?? undefined,
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
        email: data.email,
        password: data.senha,
        phone: data.telefone,
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
      email: usuarioModel.email,
      senha: usuarioModel.password,
      telefone: usuarioModel.phone ?? undefined,
      escolaId: usuarioModel.escolaId!,
      admin: usuarioModel.isAdmin,
      root: usuarioModel.isRoot,
    });
  }
}
