import { Usuario } from "../entities/usuario.entity.js";

export type CriarUsuarioData = {
  readonly nome: string;
  readonly login: string;
  readonly senha: string;
  readonly escolaId: number;
  readonly root?: boolean;
};

export abstract class UsuarioRepository {
  abstract obterUsuarioPorId(id: number): Promise<Usuario | null>;
  abstract obterUsuarioPorEmail(email: string): Promise<Usuario | null>;
  abstract criarUsuario(data: CriarUsuarioData): Promise<Usuario>;
}
