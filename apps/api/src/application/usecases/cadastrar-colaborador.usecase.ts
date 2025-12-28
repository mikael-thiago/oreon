import type { Cargo } from "../../domain/entities/cargo.entity.js";
import type { Colaborador, ContratoAtivoColaborador } from "../../domain/entities/colaborador.entity.js";
import { IllegalArgumentError } from "../../domain/errors/illegal-argument.error.js";
import { UnauthorizedError } from "../../domain/errors/unauthorized.error.js";
import { ValidationError } from "../../domain/errors/validation.error.js";
import type { CargoRepository } from "../../domain/repositories/cargo.repository.js";
import type { ColaboradorRepository } from "../../domain/repositories/colaborador.repository.js";
import type { UsuarioRepository } from "../../domain/repositories/usuario.repository.js";
import { groupBy } from "../../infra/utils/array.js";
import { cpfEhValido } from "../../infra/utils/cpf.js";
import { gerarStringAleatoria } from "../../infra/utils/string.js";
import type { CriptografiaService } from "../interfaces/criptografia.service.js";
import type { UnitOfWork } from "../interfaces/unit-of-work.interface.js";
import type { UsuarioAutenticado } from "../types/authenticated-user.type.js";

export type CadastrarColaboradorRequest = {
  readonly usuarioAutenticado: UsuarioAutenticado;
  readonly unidadeId: number;
  readonly nome: string;
  readonly cpf: string;
  readonly telefone: string;
  readonly email: string;
  readonly contrato:
    | {
        readonly cargoId: number;
        readonly dataInicio: Date;
        readonly dataFim?: Date | undefined;
        readonly salario: number;
      }
    | {
        readonly cargoId: number;
        readonly dataInicio: Date;
        readonly dataFim?: Date | undefined;
        readonly disciplinasPermitidas: { readonly disciplinaId: number; readonly etapasIds: number[] }[];
        readonly salario: number;
      };
};

type CadastrarColaboradorComumInnerRequest = Omit<CadastrarColaboradorRequest, "usuarioAutenticado" | "contrato"> & {
  readonly usuarioId: number;
  readonly contrato: {
    readonly cargoId: number;
    readonly dataInicio: Date;
    readonly dataFim?: Date | undefined;
    readonly salario: number;
  };
};

type CadastrarProfessorInnerRequest = Omit<CadastrarColaboradorRequest, "usuarioAutenticado" | "contrato"> & {
  readonly usuarioId: number;
  readonly contrato: {
    readonly cargoId: number;
    readonly dataInicio: Date;
    readonly dataFim?: Date | undefined;
    readonly disciplinasPermitidas: { readonly disciplinaId: number; readonly etapasIds: number[] }[];
    readonly salario: number;
  };
};

export class CadastrarColaboradorResponse {
  readonly id: number;
  readonly cpf: string;
  readonly email: string;
  readonly senha: string;
  readonly contrato: ContratoAtivoColaborador;

  constructor(colaborador: Colaborador, login: string, senha: string) {
    this.id = colaborador.id;
    this.cpf = colaborador.cpf;
    this.email = login;
    this.senha = senha;
    this.contrato = colaborador.ultimoContrato;
  }
}

export class CadastrarColaboradorUseCase {
  constructor(
    private readonly uow: UnitOfWork,
    private readonly usuarioRepository: UsuarioRepository,
    private readonly colaboradorRepository: ColaboradorRepository,
    private readonly cargoRepository: CargoRepository,
    private readonly criptografiaService: CriptografiaService
  ) {}

  async executar({ usuarioAutenticado, ...request }: CadastrarColaboradorRequest) {
    if (request.contrato.dataFim && request.contrato.dataInicio > request.contrato.dataFim) {
      throw new IllegalArgumentError("A data de início não pode ser maior que a data de fim");
    }

    if (!cpfEhValido(request.cpf)) {
      throw ValidationError.semantico([{ propriedade: "cpf", mensagem: `O CPF ${request.cpf} é invalido!` }]);
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
        nome: request.nome,
        login: request.email,
        escolaId: usuarioAutenticado.escolaId,
        senha: await this.criptografiaService.hashear(senha),
      });

      const cargo = await this.cargoRepository.obterCargoPorId(request.contrato.cargoId);

      if (!cargo) {
        throw ValidationError.semantico([
          { propriedade: "contrato.cargoId", mensagem: `Cargo com ID ${request.contrato.cargoId} não encontrado!` },
        ]);
      }

      const colaborador = await this.cadastrarColaborador({ ...request, usuarioId: usuario.id }, cargo);

      // TODO: Enviar email informando os dados de login do colaborador
      return new CadastrarColaboradorResponse(colaborador, usuario.login, senha);
    });
  }

  private async cadastrarProfessor(request: CadastrarProfessorInnerRequest) {
    const disciplinasPermitidasAgrupadasPorId = groupBy(request.contrato.disciplinasPermitidas, (d) => d.disciplinaId);

    const duplicadas = Object.values(disciplinasPermitidasAgrupadasPorId).filter((v) => v.length > 1);

    if (duplicadas.length > 0) {
      throw ValidationError.semantico([
        {
          propriedade: "disciplinasPermitidas",
          mensagem: "Disciplinas duplicadas foram informadas: " + JSON.stringify(duplicadas, null, 2),
        },
      ]);
    }

    return this.colaboradorRepository.criarProfessor({
      cpf: request.cpf,
      email: request.email,
      unidadeId: request.unidadeId,
      usuarioId: request.usuarioId,
      dataInicio: request.contrato.dataInicio,
      cargoId: request.contrato.cargoId,
      disciplinasPermitidas: request.contrato.disciplinasPermitidas,
      salario: request.contrato.salario,
      telefone: request.telefone,
    });
  }

  private async cadastrarColaboradorComum(request: CadastrarColaboradorComumInnerRequest) {
    return this.colaboradorRepository.criarColaborador({
      cargoId: request.contrato.cargoId,
      cpf: request.cpf,
      dataInicio: request.contrato.dataInicio,
      email: request.email,
      unidadeId: request.unidadeId,
      usuarioId: request.usuarioId,
      salario: request.contrato.salario,
      telefone: request.telefone,
    });
  }

  private async cadastrarColaborador(
    request: CadastrarColaboradorComumInnerRequest | CadastrarProfessorInnerRequest,
    cargo: Cargo
  ) {
    if (!cargo.podeEnsinar) {
      return this.cadastrarColaboradorComum({ ...request, usuarioId: request.usuarioId });
    }

    if (!("disciplinasPermitidas" in request.contrato)) {
      throw ValidationError.semantico([
        {
          propriedade: "contrato.disciplinasPermitidas",
          mensagem: "A propriedade contrato.disciplinasPermitidas deve ser informada para cadastrar um professor!",
        },
      ]);
    }

    return this.cadastrarProfessor({
      ...request,
      contrato: request.contrato,
      usuarioId: request.usuarioId,
    });
  }
}
