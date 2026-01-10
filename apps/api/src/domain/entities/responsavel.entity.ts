import { CPF } from "../value-objects/cpf.vo.js";
import { Email } from "../value-objects/email.vo.js";
import { Telefone } from "../value-objects/telefone.vo.js";
import { Nome } from "../value-objects/nome.vo.js";
import { Result } from "../shared/result.js";
import { ValidationError } from "../errors/validation.error.js";

export type ResponsavelProps = {
  readonly id: number;
  readonly nome: Nome;
  readonly cpf: CPF;
  readonly telefone: Telefone;
  readonly email: Email;
  readonly dataDeNascimento: Date;
  readonly escolaId: number;
};

export type CriarResponsavelDTO = {
  readonly id: number;
  readonly nome: string;
  readonly cpf: string;
  readonly telefone: string;
  readonly email: string;
  readonly dataDeNascimento: Date;
  readonly escolaId: number;
};

/**
 * Entidade Responsavel - representa um responsável legal de um aluno
 * Rich domain model com regras de negócio encapsuladas
 */
export class Responsavel {
  private static readonly IDADE_MINIMA = 18;
  private static readonly IDADE_MAXIMA = 120;

  readonly id: number;
  private readonly props: ResponsavelProps;

  private constructor(props: ResponsavelProps) {
    this.id = props.id;
    this.props = props;
  }

  /**
   * Cria um novo responsável com validações de negócio
   * @param dados - Dados para criar o responsável
   * @returns Result com Responsavel válido ou erro de validação
   */
  static criar(dados: CriarResponsavelDTO): Result<Responsavel, ValidationError> {
    const erros: Array<{ propriedade: string; mensagem: string }> = [];

    // Validar CPF
    const cpfResult = CPF.criar(dados.cpf);
    if (Result.isFailure(cpfResult)) {
      return Result.fail(ValidationError.semantico([{ propriedade: "cpf", mensagem: cpfResult.erro.mensagem }]));
    }

    // Validar nome
    const nomeResult = Nome.criar(dados.nome);
    if (Result.isFailure(nomeResult)) {
      return Result.fail(nomeResult.erro);
    }

    // Validar telefone
    const telefoneResult = Telefone.criar(dados.telefone);
    if (Result.isFailure(telefoneResult)) {
      return Result.fail(telefoneResult.erro);
    }

    // Validar email
    const emailResult = Email.criar(dados.email);
    if (Result.isFailure(emailResult)) {
      return Result.fail(emailResult.erro);
    }

    // Validar idade
    const idade = this.calcularIdade(dados.dataDeNascimento);
    if (idade < this.IDADE_MINIMA) {
      erros.push({
        propriedade: "dataDeNascimento",
        mensagem: `O responsável deve ter pelo menos ${this.IDADE_MINIMA} anos`,
      });
    }

    if (idade > this.IDADE_MAXIMA) {
      erros.push({
        propriedade: "dataDeNascimento",
        mensagem: `A idade do responsável não pode exceder ${this.IDADE_MAXIMA} anos`,
      });
    }

    // Validar data de nascimento no futuro
    if (dados.dataDeNascimento > new Date()) {
      erros.push({
        propriedade: "dataDeNascimento",
        mensagem: "Data de nascimento não pode ser no futuro",
      });
    }

    if (erros.length > 0) {
      return Result.fail(ValidationError.semantico(erros));
    }

    return Result.ok(
      new Responsavel({
        id: dados.id,
        nome: nomeResult.value,
        cpf: cpfResult.value,
        telefone: telefoneResult.value,
        email: emailResult.value,
        dataDeNascimento: dados.dataDeNascimento,
        escolaId: dados.escolaId,
      })
    );
  }

  /**
   * Reconstitui um responsável a partir de dados já validados do banco de dados
   * Não realiza validação - use apenas para dados persistidos
   * @param dados - Dados do responsável do banco de dados
   * @returns Instância de Responsavel
   */
  static reconstituir(dados: {
    readonly id: number;
    readonly nome: string;
    readonly cpf: string;
    readonly telefone: string;
    readonly email: string;
    readonly dataDeNascimento: Date;
    readonly escolaId: number;
  }): Responsavel {
    return new Responsavel({
      id: dados.id,
      nome: Nome.reconstituir(dados.nome),
      cpf: CPF.reconstituir(dados.cpf),
      telefone: Telefone.reconstituir(dados.telefone),
      email: Email.reconstituir(dados.email),
      dataDeNascimento: dados.dataDeNascimento,
      escolaId: dados.escolaId,
    });
  }

  /**
   * Calcula a idade do responsável
   * @returns Idade em anos
   */
  get idade(): number {
    return Responsavel.calcularIdade(this.props.dataDeNascimento);
  }

  /**
   * Verifica se o responsável é maior de idade
   * @returns true se for maior de idade, false caso contrário
   */
  isMaiorDeIdade(): boolean {
    return this.idade >= Responsavel.IDADE_MINIMA;
  }

  /**
   * Calcula a idade a partir de uma data de nascimento
   * @param dataDeNascimento - Data de nascimento
   * @returns Idade em anos
   */
  private static calcularIdade(dataDeNascimento: Date): number {
    const hoje = new Date();
    let idade = hoje.getFullYear() - dataDeNascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = dataDeNascimento.getMonth();

    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < dataDeNascimento.getDate())) {
      idade--;
    }

    return idade;
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

  get telefone(): Telefone {
    return this.props.telefone;
  }

  get telefoneFormatado(): string {
    return this.props.telefone.formatar();
  }

  get telefoneValor(): string {
    return this.props.telefone.getValor();
  }

  get email(): Email {
    return this.props.email;
  }

  get emailValor(): string {
    return this.props.email.getValor();
  }

  get dataDeNascimento(): Date {
    return this.props.dataDeNascimento;
  }

  get escolaId(): number {
    return this.props.escolaId;
  }
}
