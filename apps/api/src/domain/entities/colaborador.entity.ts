import type { StatusContrato } from "../enums/status-contrato.enum.js";
import { CPF } from "../value-objects/cpf.vo.js";
import { Email } from "../value-objects/email.vo.js";
import { Nome } from "../value-objects/nome.vo.js";
import { Result } from "../shared/result.js";
import { ValidationError, type ValidationErrorItem } from "../errors/validation.error.js";

export type UsuarioColaborador = {
  readonly id: number;
  readonly email: string;
};

export type ContratoColaborador = {
  readonly id: number;
  readonly dataInicio: Date;
  readonly dataFim?: Date | null;
  readonly cargoId: number;
  readonly status: StatusContrato;
  readonly salario: number;
};

export type ColaboradorProps = {
  readonly id: number;
  readonly nome: Nome;
  readonly cpf: CPF;
  readonly email: Email;
  readonly escolaId: number;
  readonly usuario: UsuarioColaborador;
};

export type CriarColaboradorDTO = {
  readonly id: number;
  readonly nome: string;
  readonly cpf: string;
  readonly email: string;
  readonly escolaId: number;
  readonly usuario: UsuarioColaborador;
};

/**
 * Entidade Colaborador - representa um funcionário/colaborador da escola
 * Rich domain model com regras de negócio encapsuladas
 */
export class Colaborador {
  readonly id: number;
  private readonly props: ColaboradorProps;

  private constructor(props: ColaboradorProps) {
    this.id = props.id;
    this.props = props;
  }

  /**
   * Cria um novo colaborador com validações de negócio
   * @param dados - Dados para criar o colaborador
   * @returns Result com Colaborador válido ou erro de validação
   */
  static criar(dados: CriarColaboradorDTO): Result<Colaborador, ValidationError> {
    const erros: ValidationErrorItem[] = [];

    // Validar CPF
    const cpfResult = CPF.criar(dados.cpf);
    if (Result.isFailure(cpfResult)) {
      erros.push({ propriedade: "cpf", mensagem: cpfResult.erro.mensagem });
    }

    // Validar email
    const emailResult = Email.criar(dados.email);
    if (Result.isFailure(emailResult)) {
      erros.push(...emailResult.erro.erros);
    }

    // Validar nome
    const nomeResult = Nome.criar(dados.nome);
    if (Result.isFailure(nomeResult)) {
      erros.push(...nomeResult.erro.erros);
    }

    if (
      erros.length > 0 ||
      Result.isFailure(nomeResult) ||
      Result.isFailure(cpfResult) ||
      Result.isFailure(emailResult)
    ) {
      return Result.fail(ValidationError.semantico(erros));
    }

    return Result.ok(
      new Colaborador({
        id: dados.id,
        nome: nomeResult.value,
        cpf: cpfResult.value,
        email: emailResult.value,
        escolaId: dados.escolaId,
        usuario: dados.usuario,
      })
    );
  }

  /**
   * Reconstitui um colaborador a partir de dados já validados do banco de dados
   * Não realiza validação - use apenas para dados persistidos
   * @param dados - Dados do colaborador do banco de dados
   * @returns Instância de Colaborador
   */
  static reconstituir(dados: {
    readonly id: number;
    readonly nome: string;
    readonly cpf: string;
    readonly email: string;
    readonly escolaId: number;
    readonly usuario: UsuarioColaborador;
  }): Colaborador {
    return new Colaborador({
      id: dados.id,
      nome: Nome.reconstituir(dados.nome),
      cpf: CPF.reconstituir(dados.cpf),
      email: Email.reconstituir(dados.email),
      escolaId: dados.escolaId,
      usuario: dados.usuario,
    });
  }

  // Getters para acessar propriedades
  get nome(): Nome {
    return this.props.nome;
  }

  get nomeCompleto(): string {
    return this.props.nome.getValor();
  }

  get cpf(): CPF {
    return this.props.cpf;
  }

  get cpfFormatado(): string {
    return this.props.cpf.formatar();
  }

  get cpfValor(): string {
    return this.props.cpf.getValor();
  }

  get email(): Email {
    return this.props.email;
  }

  get emailValor(): string {
    return this.props.email.getValor();
  }

  get escolaId(): number {
    return this.props.escolaId;
  }

  get usuario(): UsuarioColaborador {
    return this.props.usuario;
  }
}
