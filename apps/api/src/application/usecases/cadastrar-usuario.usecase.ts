import { CriptografiaService } from "../interfaces/criptografia.service.js";
import { ConflictError } from "../../domain/errors/conflict.error.js";
import { UsuarioRepository } from "../../domain/repositories/usuario.repository.js";
import { EscolaRepository } from "../../domain/repositories/escola.repository.js";
import { IllegalArgumentError } from "../../domain/errors/illegal-argument.error.js";

export type CadastrarUsuarioRequest = {
  readonly nome: string;
  readonly login: string;
  readonly senha: string;
  readonly escolaId: number;
};

export type CadastrarUsuarioResponse = {
  readonly id: number;
  readonly nome: string;
  readonly login: string;
  readonly escolaId: number;
};

export class CadastrarUsuarioUseCase {
  private readonly usuarioRepository: UsuarioRepository;
  private readonly escolaRepository: EscolaRepository;
  private readonly criptografiaService: CriptografiaService;

  constructor(
    usuarioRepository: UsuarioRepository,
    escolaRepository: EscolaRepository,
    criptografiaService: CriptografiaService
  ) {
    this.usuarioRepository = usuarioRepository;
    this.escolaRepository = escolaRepository;
    this.criptografiaService = criptografiaService;
  }

  async executar(request: CadastrarUsuarioRequest): Promise<CadastrarUsuarioResponse> {
    const usuarioExistente = await this.usuarioRepository.obterUsuarioPorEmail(request.login);

    if (usuarioExistente) {
      throw new ConflictError("Já existe um usuário com este email");
    }

    const escolaExiste = await this.escolaRepository.existe(request.escolaId);

    if (!escolaExiste) {
      throw new IllegalArgumentError(`Escola com ID ${request.escolaId} não encontrada`);
    }

    const senhaHasheada = await this.criptografiaService.hashear(request.senha);

    const usuario = await this.usuarioRepository.criarUsuario({
      nome: request.nome,
      login: request.login,
      senha: senhaHasheada,
      escolaId: request.escolaId,
    });

    return {
      id: usuario.id,
      nome: usuario.nome,
      login: usuario.login,
      escolaId: usuario.escolaId,
    };
  }
}
