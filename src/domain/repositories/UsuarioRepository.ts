import { Usuario } from "../entities/Usuario.js";

export type CriarUsuarioData = {
  readonly nome: string;
  readonly email: string;
  readonly senha: string;
  readonly telefone?: string | undefined;
  readonly escolaId: number;
};

export abstract class UsuarioRepository {
  abstract obterUsuarioPorEmail(email: string): Promise<Usuario | null>;
  abstract criarUsuario(data: CriarUsuarioData): Promise<Usuario>;
}
