import type { Sexo } from "../enums/sexo.enum.js";
import { CPF } from "../value-objects/cpf.vo.js";
import { Nome } from "../value-objects/nome.vo.js";
import { Result, type OkResult } from "../shared/result.js";
import { ValidationError } from "../errors/validation.error.js";
import { DateUnit } from "@oreon/utils/date";

export type AlunoProps = {
  readonly id: number;
  readonly nome: Nome;
  readonly cpf: CPF;
  readonly dataDeNascimento: Date;
  readonly sexo: Sexo | null;
  readonly escolaId: number;
};

export type CriarAlunoDTO = {
  readonly id: number;
  readonly nome: string;
  readonly cpf: string;
  readonly dataDeNascimento: Date;
  readonly sexo: Sexo | null;
  readonly escolaId: number;
};

/**
 * Entidade Aluno - representa um estudante no sistema
 * Rich domain model com regras de negócio encapsuladas
 */
export class Aluno {
  private static readonly IDADE_MINIMA = 3;
  private static readonly IDADE_MAXIMA = 100;

  readonly id: number;
  private readonly props: AlunoProps;

  private constructor(props: AlunoProps) {
    this.id = props.id;
    this.props = props;
  }

  /**
   * Cria um novo aluno com validações de negócio
   * @param dados - Dados para criar o aluno
   * @returns Result com Aluno válido ou erro de validação
   */
  static criar(dados: CriarAlunoDTO): Result<Aluno, ValidationError> {
    const erros: Array<{ propriedade: string; mensagem: string }> = [];

    // Validar CPF
    const cpfResult = CPF.criar(dados.cpf);
    if (Result.isFailure(cpfResult)) {
      erros.push({ propriedade: "cpf", mensagem: cpfResult.erro.mensagem });
    }

    // Validar nome
    const nomeResult = Nome.criar(dados.nome);
    if (Result.isFailure(nomeResult)) {
      erros.push(...nomeResult.erro.erros);
    }

    // Validar idade
    const idade = DateUnit.Days.diff(dados.dataDeNascimento, new Date());
    if (idade < this.IDADE_MINIMA || idade > this.IDADE_MAXIMA) {
      erros.push({
        propriedade: "dataDeNascimento",
        mensagem: `A idade deve estar entre ${this.IDADE_MINIMA} e ${this.IDADE_MAXIMA} anos`,
      });
    }

    if (erros.length > 0) {
      return Result.fail(ValidationError.semantico(erros));
    }

    return Result.ok(
      new Aluno({
        id: dados.id,
        nome: (nomeResult as OkResult<Nome>).value,
        cpf: (cpfResult as OkResult<CPF>).value,
        dataDeNascimento: dados.dataDeNascimento,
        sexo: dados.sexo,
        escolaId: dados.escolaId,
      })
    );
  }

  /**
   * Reconstitui um aluno a partir de dados já validados do banco de dados
   * Não realiza validação - use apenas para dados persistidos
   * @param dados - Dados do aluno do banco de dados
   * @returns Instância de Aluno
   */
  static reconstituir(dados: {
    readonly id: number;
    readonly nome: string;
    readonly cpf: string;
    readonly dataDeNascimento: Date;
    readonly sexo: Sexo | null;
    readonly escolaId: number;
  }): Aluno {
    return new Aluno({
      id: dados.id,
      nome: Nome.reconstituir(dados.nome),
      cpf: CPF.reconstituir(dados.cpf),
      dataDeNascimento: dados.dataDeNascimento,
      sexo: dados.sexo,
      escolaId: dados.escolaId,
    });
  }

  /**
   * Calcula a idade do aluno
   * @returns Idade em anos
   */
  get idade(): number {
    return DateUnit.Days.diff(this.props.dataDeNascimento, new Date());
  }

  /**
   * Verifica se o aluno pode ser matriculado (idade válida)
   * @returns true se pode ser matriculado, false caso contrário
   */
  podeSerMatriculado(): boolean {
    return this.idade >= Aluno.IDADE_MINIMA && this.idade <= Aluno.IDADE_MAXIMA;
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

  get dataDeNascimento(): Date {
    return this.props.dataDeNascimento;
  }

  get sexo(): Sexo | null {
    return this.props.sexo;
  }

  get escolaId(): number {
    return this.props.escolaId;
  }
}
