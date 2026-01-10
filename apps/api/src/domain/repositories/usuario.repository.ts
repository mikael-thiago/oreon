import { Usuario } from "../entities/usuario.entity.js";

export abstract class UsuarioRepository {
  abstract obterProximoId(): Promise<number>;
  abstract obterUsuarioPorId(id: number): Promise<Usuario | null>;
  abstract obterUsuarioPorEmail(email: string): Promise<Usuario | null>;
  abstract salvar(usuario: Usuario): Promise<Usuario>;
}
