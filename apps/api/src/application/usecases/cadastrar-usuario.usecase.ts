import { CriptografiaService } from "../interfaces/criptografia.service.js";
import { ConflictError } from "../../domain/errors/conflict.error.js";
import { UsuarioRepository } from "../../domain/repositories/usuario.repository.js";
import { EscolaRepository } from "../../domain/repositories/escola.repository.js";
import { IllegalArgumentError } from "../../domain/errors/illegal-argument.error.js";
import { Usuario } from "../../domain/entities/usuario.entity.js";
import { Result } from "../../domain/shared/result.js";

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

  async executar(
    request: CadastrarUsuarioRequest
  ): Promise<Result<CadastrarUsuarioResponse, ConflictError | IllegalArgumentError>> {
    const usuarioExistente = await this.usuarioRepository.obterUsuarioPorEmail(request.login);

    if (usuarioExistente) {
      return Result.fail(new ConflictError("Já existe um usuário com este email"));
    }

    const escolaExiste = await this.escolaRepository.existe(request.escolaId);

    if (!escolaExiste) {
      return Result.fail(new IllegalArgumentError(`Escola com ID ${request.escolaId} não encontrada`));
    }

    const senhaHasheada = await this.criptografiaService.hashear(request.senha);

    const usuario = new Usuario({
      id: await this.usuarioRepository.obterProximoId(),
      nome: request.nome,
      login: request.login,
      senha: senhaHasheada,
      escolaId: request.escolaId,
      admin: false,
      root: false,
    });

    await this.usuarioRepository.salvar(usuario);

    return Result.ok({
      id: usuario.id,
      nome: usuario.nome,
      login: usuario.login,
      escolaId: usuario.escolaId,
    });
  }
}
