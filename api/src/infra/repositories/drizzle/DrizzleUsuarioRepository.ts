import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Usuario } from "../../../domain/entities/Usuario.js";
import type { CriarUsuarioData, UsuarioRepository } from "../../../domain/repositories/UsuarioRepository.js";
import { usuarioTable } from "./schema.js";
import type { DrizzleService } from "./DrizzleService.js";

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
      nome: usuarioModel.nome,
      email: usuarioModel.email,
      senha: usuarioModel.senha,
      telefone: usuarioModel.telefone ?? undefined,
      escolaId: usuarioModel.escolaId!,
      admin: usuarioModel.isAdmin,
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
      nome: usuarioModel.nome,
      email: usuarioModel.email,
      senha: usuarioModel.senha,
      telefone: usuarioModel.telefone ?? undefined,
      escolaId: usuarioModel.escolaId!,
      admin: usuarioModel.isAdmin,
    });
  }

  async criarUsuario(data: CriarUsuarioData): Promise<Usuario> {
    const [usuarioModel] = await this.drizzle
      .getTransaction()
      .insert(usuarioTable)
      .values({
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        telefone: data.telefone,
        escolaId: data.escolaId,
      })
      .returning();

    if (!usuarioModel) {
      throw new Error("Falha ao criar usuário");
    }

    return new Usuario({
      id: usuarioModel.id,
      nome: usuarioModel.nome,
      email: usuarioModel.email,
      senha: usuarioModel.senha,
      telefone: usuarioModel.telefone ?? undefined,
      escolaId: usuarioModel.escolaId!,
      admin: usuarioModel.isAdmin,
    });
  }
}
