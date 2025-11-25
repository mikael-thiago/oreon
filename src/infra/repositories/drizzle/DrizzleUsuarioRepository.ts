import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Usuario } from "../../../domain/entities/Usuario.js";
import type { CriarUsuarioData, UsuarioRepository } from "../../../domain/repositories/UsuarioRepository.js";
import { usuarioTable } from "./schema.js";

export class DrizzleUsuarioRepository implements UsuarioRepository {
  constructor(private readonly drizzleDb: ReturnType<typeof drizzle>) {}

  async obterUsuarioPorEmail(email: string): Promise<Usuario | null> {
    const [usuarioModel] = await this.drizzleDb
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
      escolaId: usuarioModel.escolaId,
    });
  }

  async criarUsuario(data: CriarUsuarioData): Promise<Usuario> {
    const [usuarioModel] = await this.drizzleDb
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
      escolaId: usuarioModel.escolaId,
    });
  }
}
