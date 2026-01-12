import { groupBy } from "@oreon/utils/array";
import { cpfEhValido } from "@oreon/utils/cpf";
import { gerarStringAleatoria } from "@oreon/utils/string";
import type { Cargo } from "../../domain/entities/cargo.entity.js";
import { Colaborador } from "../../domain/entities/colaborador.entity.js";
import { ContratoComum, ContratoProfessor, type Contrato } from "../../domain/entities/contrato.entity.js";
import { Usuario } from "../../domain/entities/usuario.entity.js";
import { StatusContratoEnum, type StatusContrato } from "../../domain/enums/status-contrato.enum.js";
import { IllegalArgumentError } from "../../domain/errors/illegal-argument.error.js";
import { UnauthorizedError } from "../../domain/errors/unauthorized.error.js";
import { ValidationError } from "../../domain/errors/validation.error.js";
import type { CargoRepository } from "../../domain/repositories/cargo.repository.js";
import type { ColaboradorRepository } from "../../domain/repositories/colaborador.repository.js";
import type { ContratoRepository } from "../../domain/repositories/contrato.repository.js";
import type { UsuarioRepository } from "../../domain/repositories/usuario.repository.js";
import type { CriptografiaService } from "../interfaces/criptografia.service.js";
import type { UnitOfWork } from "../interfaces/unit-of-work.interface.js";
import type { UsuarioAutenticado } from "../types/authenticated-user.type.js";
import { Result } from "../../domain/shared/result.js";

export type CadastrarColaboradorRequest = {
  readonly usuarioAutenticado: UsuarioAutenticado;
  readonly unidadeId: number;
  readonly nome: string;
  readonly cpf: string;
  readonly telefone: string;
  readonly email: string;
  readonly dataDeNascimento: Date;
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

type CadastrarContratoComumRequest = {
  readonly unidadeId: number;
  readonly contrato: {
    readonly cargoId: number;
    readonly dataInicio: Date;
    readonly dataFim?: Date | undefined;
    readonly salario: number;
  };
};

type CadastrarContratoProfessorRequest = {
  readonly unidadeId: number;
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
  readonly contrato: {
    readonly id: number;
    readonly dataInicio: Date;
    readonly dataFim?: Date | null;
    readonly cargoId: number;
    readonly status: StatusContrato;
    readonly salario: number;
  };

  constructor(colaborador: Colaborador, contrato: Contrato, login: string, senha: string) {
    this.id = colaborador.id;
    this.cpf = colaborador.cpf.getValor();
    this.email = login;
    this.senha = senha;
    this.contrato = {
      id: contrato.id,
      dataInicio: contrato.dataInicio,
      dataFim: contrato.dataFim,
      cargoId: contrato.cargoId,
      status: contrato.status,
      salario: contrato.salario.getValor(),
    };
  }
}

export class CadastrarColaboradorUseCase {
  constructor(
    private readonly uow: UnitOfWork,
    private readonly usuarioRepository: UsuarioRepository,
    private readonly colaboradorRepository: ColaboradorRepository,
    private readonly contratoRepository: ContratoRepository,
    private readonly cargoRepository: CargoRepository,
    private readonly criptografiaService: CriptografiaService
  ) {}

  async executar({ usuarioAutenticado, ...request }: CadastrarColaboradorRequest): Promise<Result<CadastrarColaboradorResponse, ValidationError | IllegalArgumentError | UnauthorizedError>> {
    if (request.contrato.dataFim && request.contrato.dataInicio > request.contrato.dataFim) {
      return Result.fail(new IllegalArgumentError("A data de início não pode ser maior que a data de fim"));
    }

    if (!cpfEhValido(request.cpf)) {
      return Result.fail(ValidationError.semantico([{ propriedade: "cpf", mensagem: `O CPF ${request.cpf} é invalido!` }]));
    }

    const usuarioQueEstaCriando = await this.usuarioRepository.obterUsuarioPorId(usuarioAutenticado.id);

    if (!usuarioQueEstaCriando)
      return Result.fail(new IllegalArgumentError(`Usuário com ID ${usuarioAutenticado.id} não encontrado!`));
    // Nota: Por enquanto
    if (!usuarioQueEstaCriando.root)
      return Result.fail(new UnauthorizedError("Somente o usuário raiz da escola pode cadatrar colaboradores"));

    return this.uow.transact(async () => {
      const senha = gerarStringAleatoria(12);

      const usuario = new Usuario({
        id: await this.usuarioRepository.obterProximoId(),
        nome: request.nome,
        login: request.email,
        escolaId: usuarioAutenticado.escolaId,
        senha: await this.criptografiaService.hashear(senha),
        admin: false,
        root: false,
      });

      await this.usuarioRepository.salvar(usuario);

      const cargo = await this.cargoRepository.obterCargoPorId(request.contrato.cargoId);

      if (!cargo) {
        return Result.fail(ValidationError.semantico([
          { propriedade: "contrato.cargoId", mensagem: `Cargo com ID ${request.contrato.cargoId} não encontrado!` },
        ]));
      }

      const colaboradorResult = Colaborador.criar({
        id: await this.colaboradorRepository.obterProximoId(),
        cpf: request.cpf,
        email: request.email,
        nome: request.nome,
        escolaId: usuarioAutenticado.escolaId,
        usuario: {
          id: usuario.id,
          email: usuario.login,
        },
      });

      if (Result.isFailure(colaboradorResult)) {
        return colaboradorResult;
      }

      await this.colaboradorRepository.adicionar(colaboradorResult.value);

      const contratoResult = await this.criarContratoColaborador(request, cargo, colaboradorResult.value.id);

      if (Result.isFailure(contratoResult)) {
        return contratoResult;
      }

      await this.contratoRepository.adicionar(contratoResult.value);

      // TODO: Enviar email informando os dados de login do colaborador
      return Result.ok(new CadastrarColaboradorResponse(colaboradorResult.value, contratoResult.value, usuario.login, senha));
    });
  }

  private async criarContratoColaborador(
    request: CadastrarContratoComumRequest | CadastrarContratoProfessorRequest,
    cargo: Cargo,
    colaboradorId: number
  ): Promise<Result<Contrato, ValidationError>> {
    if (!cargo.podeEnsinar) {
      return ContratoComum.criar({
        id: await this.contratoRepository.obterProximoId(),
        cargoId: request.contrato.cargoId,
        dataInicio: request.contrato.dataInicio,
        dataFim: request.contrato.dataFim ?? null,
        colaboradorId,
        matricula: "",
        status: StatusContratoEnum.Inativo,
        unidadeId: request.unidadeId,
        salario: request.contrato.salario,
      });
    }

    if (!("disciplinasPermitidas" in request.contrato)) {
      return Result.fail(
        ValidationError.semantico([
          {
            propriedade: "contrato.disciplinasPermitidas",
            mensagem: "A propriedade contrato.disciplinasPermitidas deve ser informada para cadastrar um professor!",
          },
        ])
      );
    }

    const disciplinasPermitidasAgrupadasPorId = groupBy(request.contrato.disciplinasPermitidas, (d) => d.disciplinaId);

    const duplicadas = Object.values(disciplinasPermitidasAgrupadasPorId).filter((v) => v.length > 1);

    if (duplicadas.length > 0) {
      return Result.fail(ValidationError.semantico([
        {
          propriedade: "disciplinasPermitidas",
          mensagem: "Disciplinas duplicadas foram informadas: " + JSON.stringify(duplicadas, null, 2),
        },
      ]));
    }

    return ContratoProfessor.criar({
      id: await this.contratoRepository.obterProximoId(),
      cargoId: request.contrato.cargoId,
      dataInicio: request.contrato.dataInicio,
      dataFim: request.contrato.dataFim ?? null,
      colaboradorId,
      matricula: "",
      status: StatusContratoEnum.Inativo,
      unidadeId: request.unidadeId,
      salario: request.contrato.salario,
      disciplinas: request.contrato.disciplinasPermitidas.flatMap((request) =>
        request.etapasIds.map((etapaId) => ({ disciplinaId: request.disciplinaId, etapaId }))
      ),
    });
  }
}
