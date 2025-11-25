import { CriptografiaService } from "../interfaces/CriptografiaService.js";
import { ConflictError } from "../../domain/errors/ConflictError.js";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository.js";
import { EscolaRepository } from "../../domain/repositories/EscolaRepository.js";
import { IllegalArgumentError } from "../../domain/errors/IllegalArgumentError.js";

export type CadastrarUsuarioRequest = {
  readonly nome: string;
  readonly email: string;
  readonly senha: string;
  readonly telefone?: string | undefined;
  readonly escolaId: number;
};

export type CadastrarUsuarioResponse = {
  readonly id: number;
  readonly nome: string;
  readonly email: string;
  readonly telefone: string | null;
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
    const usuarioExistente = await this.usuarioRepository.obterUsuarioPorEmail(request.email);

    if (usuarioExistente) {
      throw new ConflictError("Já existe um usuário com este email");
    }

    const escolaExiste = await this.escolaRepository.existe(request.escolaId);

    if (!escolaExiste) {
      throw new IllegalArgumentError("Escola não encontrada");
    }

    const senhaHasheada = await this.criptografiaService.hashear(request.senha);

    const usuario = await this.usuarioRepository.criarUsuario({
      nome: request.nome,
      email: request.email,
      senha: senhaHasheada,
      telefone: request.telefone,
      escolaId: request.escolaId,
    });

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone ?? null,
      escolaId: usuario.escolaId,
    };
  }
}
