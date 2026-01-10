import { ValidationError } from "../errors/validation.error.js";
import { Result } from "../shared/result.js";

/**
 * Value Object que representa o nome de uma pessoa
 * Aplica regras de negócio para nomes
 */
export class Nome {
  private static readonly MIN_LENGTH = 2;
  private static readonly MAX_LENGTH = 255;

  private constructor(private readonly valor: string) {}

  /**
   * Cria um Nome a partir de uma string
   * @param nome - Nome da pessoa
   * @param campo - Nome do campo para mensagens de erro (padrão: "nome")
   * @returns Result com Nome válido ou erro de validação
   */
  static criar(nome: string, campo: string = "nome"): Result<Nome, ValidationError> {
    const nomeLimpo = nome.trim();

    if (!nomeLimpo) {
      return Result.fail(
        ValidationError.semantico([
          {
            propriedade: campo,
            mensagem: "O nome não pode estar vazio",
          },
        ])
      );
    }

    if (nomeLimpo.length < this.MIN_LENGTH) {
      return Result.fail(
        ValidationError.semantico([
          {
            propriedade: campo,
            mensagem: `O nome deve ter pelo menos ${this.MIN_LENGTH} caracteres`,
          },
        ])
      );
    }

    if (nomeLimpo.length > this.MAX_LENGTH) {
      return Result.fail(
        ValidationError.semantico([
          {
            propriedade: campo,
            mensagem: `O nome não pode ter mais de ${this.MAX_LENGTH} caracteres`,
          },
        ])
      );
    }

    // Verifica se contém apenas letras, espaços e caracteres acentuados
    const nomeRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    if (!nomeRegex.test(nomeLimpo)) {
      return Result.fail(
        ValidationError.semantico([
          {
            propriedade: campo,
            mensagem: "O nome contém caracteres inválidos",
          },
        ])
      );
    }

    return Result.ok(new Nome(nomeLimpo));
  }

  /**
   * Reconstitui um Nome a partir de dados já validados do banco de dados
   * Não realiza validação - use apenas para dados persistidos
   * @param nome - Nome da pessoa
   * @returns Instância de Nome
   */
  static reconstituir(nome: string): Nome {
    return new Nome(nome.trim());
  }

  /**
   * Retorna o nome completo
   * @returns Nome completo
   */
  toString(): string {
    return this.valor;
  }

  /**
   * Retorna o nome completo
   * @returns Nome completo
   */
  getValor(): string {
    return this.valor;
  }

  /**
   * Retorna o primeiro nome
   * @returns Primeiro nome
   */
  getPrimeiroNome(): string {
    return this.valor.split(" ")[0]!;
  }

  /**
   * Retorna o sobrenome (tudo após o primeiro nome)
   * @returns Sobrenome ou string vazia se não houver
   */
  getSobrenome(): string {
    const partes = this.valor.split(" ");
    return partes.slice(1).join(" ");
  }

  /**
   * Retorna o nome abreviado (primeiro nome + último sobrenome)
   * @returns Nome abreviado (ex: "João Silva")
   */
  getAbreviado(): string {
    const partes = this.valor.split(" ");
    if (partes.length === 1) {
      return partes[0]!;
    }
    return `${partes[0]} ${partes[partes.length - 1]}`;
  }

  /**
   * Retorna as iniciais do nome
   * @returns Iniciais (ex: "J.S.")
   */
  getIniciais(): string {
    return this.valor
      .split(" ")
      .map((parte) => parte[0]!.toUpperCase())
      .join(".");
  }

  /**
   * Compara dois nomes
   * @param outro - Outro nome para comparar
   * @returns true se forem iguais, false caso contrário
   */
  equals(outro: Nome): boolean {
    return this.valor === outro.valor;
  }
}
