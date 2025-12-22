import { IllegalArgumentError } from "../../domain/errors/IllegalArgumentError.js";
import { UnauthorizedError } from "../../domain/errors/UnauthorizedError.js";
import type { ColaboradorRepository } from "../../domain/repositories/ColaboradorRepository.js";
import type { UsuarioRepository } from "../../domain/repositories/UsuarioRepository.js";
import { cpfEhValido } from "../../infra/utils/cpf.js";
import { gerarStringAleatoria } from "../../infra/utils/string.js";
import type { CriptografiaService } from "../interfaces/CriptografiaService.js";
import type { UnitOfWork } from "../interfaces/UnitOfWork.js";
import type { UsuarioAutenticado } from "../types/AuthenticatedUser.js";

export type CadastrarColaboradorRequest = {
  readonly usuarioAutenticado: UsuarioAutenticado;
  readonly unidadeId: number;
  readonly nome: string;
  readonly cpf: string;
  readonly telefone: string;
  readonly email: string;
  readonly contrato: {
    readonly cargoId: number;
    readonly dataInicio: Date;
    readonly dataFim?: Date | undefined;
  };
};

type CadastrarProfessorRequest = CadastrarColaboradorRequest & {
  readonly restricoes: {
    readonly disciplinaId: number;
    readonly etapasIds: number[];
  }[];
};

export type CadastrarColaboradorResponse = {};

export class CadastrarColaboradorUseCase {
  constructor(
    private readonly uow: UnitOfWork,
    private readonly usuarioRepository: UsuarioRepository,
    private readonly colaboradorRepository: ColaboradorRepository,
    private readonly criptografiaService: CriptografiaService
  ) {}

  async executar({ usuarioAutenticado, ...request }: CadastrarColaboradorRequest) {
    if (request.contrato.dataFim && request.contrato.dataInicio > request.contrato.dataFim) {
      throw new IllegalArgumentError("A data de início não pode ser maior que a data de fim");
    }

    if (!cpfEhValido(request.cpf)) {
      throw new IllegalArgumentError(`O CPF ${request.cpf} é invalido!`);
    }

    const usuarioQueEstaCriando = await this.usuarioRepository.obterUsuarioPorId(usuarioAutenticado.id);

    if (!usuarioQueEstaCriando)
      throw new IllegalArgumentError(`Usuário com ID ${usuarioAutenticado.id} não encontrado!`);
    // Nota: Por enquanto
    if (!usuarioQueEstaCriando.root)
      throw new UnauthorizedError("Somente o usuário raiz da escola pode cadatrar colaboradores");

    return this.uow.transact(async () => {
      const senha = gerarStringAleatoria(12);

      const usuario = await this.usuarioRepository.criarUsuario({
        email: request.email,
        escolaId: usuarioAutenticado.escolaId,
        nome: request.nome,
        senha: await this.criptografiaService.hashear(senha),
        telefone: request.telefone,
      });

      const colaborador = await this.colaboradorRepository.criarColaborador({
        cargoId: request.contrato.cargoId,
        cpf: request.cpf,
        dataInicio: request.contrato.dataInicio,
        email: request.email,
        unidadeId: request.unidadeId,
        usuarioId: usuario.id,
      });

      // TODO: Enviar email informando os dados de login do colaborador
      return {
        id: colaborador.id,
        cpf: colaborador.cpf,
        email: usuario.email,
        senha,
        contrato: colaborador.ultimoContrato,
      };
    });
  }

  private async cadastrarProfessor({}: CadastrarProfessorRequest) {
    
  }
}
