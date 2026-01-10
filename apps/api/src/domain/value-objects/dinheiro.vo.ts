import { ValidationError } from "../errors/validation.error.js";
import { Result } from "../shared/result.js";

export enum Moeda {
  BRL = "BRL",
  USD = "USD",
  EUR = "EUR",
}

/**
 * Value Object que representa um valor monetário
 * Garante que valores negativos não sejam criados e fornece operações monetárias seguras
 */
export class Dinheiro {
  private constructor(private readonly valor: number, private readonly moeda: Moeda = Moeda.BRL) {}

  /**
   * Cria um Dinheiro a partir de um valor numérico
   * @param valor - Valor monetário
   * @param moeda - Moeda (padrão: BRL)
   * @param campo - Nome do campo para mensagens de erro
   * @returns Result com Dinheiro válido ou erro de validação
   */
  static criar(valor: number, moeda: Moeda = Moeda.BRL, campo: string = "valor"): Result<Dinheiro, ValidationError> {
    if (typeof valor !== "number" || Number.isNaN(valor)) {
      return Result.fail(
        ValidationError.semantico([
          {
            propriedade: campo,
            mensagem: "O valor deve ser um número válido",
          },
        ])
      );
    }

    if (valor < 0) {
      return Result.fail(
        ValidationError.semantico([
          {
            propriedade: campo,
            mensagem: "O valor não pode ser negativo",
          },
        ])
      );
    }

    if (!Number.isFinite(valor)) {
      return Result.fail(
        ValidationError.semantico([
          {
            propriedade: campo,
            mensagem: "O valor deve ser finito",
          },
        ])
      );
    }

    // Arredonda para 2 casas decimais
    const valorArredondado = Math.round(valor * 100) / 100;

    return Result.ok(new Dinheiro(valorArredondado, moeda));
  }

  /**
   * Reconstitui um Dinheiro a partir de dados já validados do banco de dados
   * Não realiza validação - use apenas para dados persistidos
   * @param valor - Valor monetário
   * @param moeda - Moeda (padrão: BRL)
   * @returns Instância de Dinheiro
   */
  static reconstituir(valor: number, moeda: Moeda = Moeda.BRL): Dinheiro {
    const valorArredondado = Math.round(valor * 100) / 100;
    return new Dinheiro(valorArredondado, moeda);
  }

  /**
   * Cria um Dinheiro com valor zero
   * @param moeda - Moeda (padrão: BRL)
   * @returns Instância de Dinheiro com valor zero
   */
  static zero(moeda: Moeda = Moeda.BRL): Dinheiro {
    return new Dinheiro(0, moeda);
  }

  /**
   * Retorna o valor numérico
   * @returns Valor monetário
   */
  getValor(): number {
    return this.valor;
  }

  /**
   * Retorna a moeda
   * @returns Moeda
   */
  getMoeda(): Moeda {
    return this.moeda;
  }

  /**
   * Soma dois valores monetários
   * @param outro - Outro valor para somar
   * @returns Novo Dinheiro com a soma
   * @throws Error se as moedas forem diferentes
   */
  somar(outro: Dinheiro): Dinheiro {
    this.validarMesmaMoeda(outro);
    return new Dinheiro(this.valor + outro.valor, this.moeda);
  }

  /**
   * Subtrai dois valores monetários
   * @param outro - Valor a subtrair
   * @returns Result com novo Dinheiro ou erro se resultado for negativo
   */
  subtrair(outro: Dinheiro): Result<Dinheiro, ValidationError> {
    this.validarMesmaMoeda(outro);
    const resultado = this.valor - outro.valor;

    if (resultado < 0) {
      return Result.fail(
        ValidationError.semantico([
          {
            propriedade: "valor",
            mensagem: "A subtração resultaria em valor negativo",
          },
        ])
      );
    }

    return Result.ok(new Dinheiro(resultado, this.moeda));
  }

  /**
   * Multiplica o valor por um fator
   * @param fator - Fator de multiplicação
   * @returns Novo Dinheiro com o valor multiplicado
   */
  multiplicar(fator: number): Dinheiro {
    const resultado = this.valor * fator;
    const valorArredondado = Math.round(resultado * 100) / 100;
    return new Dinheiro(valorArredondado, this.moeda);
  }

  /**
   * Divide o valor por um divisor
   * @param divisor - Divisor
   * @returns Result com novo Dinheiro ou erro se divisor for zero
   */
  dividir(divisor: number): Result<Dinheiro, ValidationError> {
    if (divisor === 0) {
      return Result.fail(
        ValidationError.semantico([
          {
            propriedade: "valor",
            mensagem: "Não é possível dividir por zero",
          },
        ])
      );
    }

    const resultado = this.valor / divisor;
    const valorArredondado = Math.round(resultado * 100) / 100;
    return Result.ok(new Dinheiro(valorArredondado, this.moeda));
  }

  /**
   * Calcula a porcentagem do valor
   * @param porcentagem - Porcentagem (ex: 10 para 10%)
   * @returns Novo Dinheiro com o valor da porcentagem
   */
  porcentagem(porcentagem: number): Dinheiro {
    return this.multiplicar(porcentagem / 100);
  }

  /**
   * Verifica se o valor é zero
   * @returns true se for zero, false caso contrário
   */
  isZero(): boolean {
    return this.valor === 0;
  }

  /**
   * Verifica se o valor é maior que outro
   * @param outro - Outro valor para comparar
   * @returns true se for maior, false caso contrário
   */
  isMaiorQue(outro: Dinheiro): boolean {
    this.validarMesmaMoeda(outro);
    return this.valor > outro.valor;
  }

  /**
   * Verifica se o valor é menor que outro
   * @param outro - Outro valor para comparar
   * @returns true se for menor, false caso contrário
   */
  isMenorQue(outro: Dinheiro): boolean {
    this.validarMesmaMoeda(outro);
    return this.valor < outro.valor;
  }

  /**
   * Retorna o valor formatado como moeda
   * @returns Valor formatado (ex: R$ 1.234,56)
   */
  formatar(): string {
    const locale = this.moeda === Moeda.BRL ? "pt-BR" : this.moeda === Moeda.USD ? "en-US" : "de-DE";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: this.moeda,
    }).format(this.valor);
  }

  /**
   * Retorna o valor como string
   * @returns Valor formatado
   */
  toString(): string {
    return this.formatar();
  }

  /**
   * Compara dois valores monetários
   * @param outro - Outro valor para comparar
   * @returns true se forem iguais, false caso contrário
   */
  equals(outro: Dinheiro): boolean {
    return this.valor === outro.valor && this.moeda === outro.moeda;
  }

  private validarMesmaMoeda(outro: Dinheiro): void {
    if (this.moeda !== outro.moeda) {
      throw new Error(`Não é possível operar com moedas diferentes: ${this.moeda} e ${outro.moeda}`);
    }
  }
}
