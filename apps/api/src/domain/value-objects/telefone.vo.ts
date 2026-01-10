import { ValidationError } from "../errors/validation.error.js";
import { Result } from "../shared/result.js";

/**
 * Value Object que representa um número de telefone brasileiro
 * Aceita telefones fixos (10 dígitos) e celulares (11 dígitos)
 */
export class Telefone {
  private static readonly TELEFONE_REGEX = /^\d{10,11}$/;

  private constructor(private readonly valor: string) {}

  /**
   * Cria um Telefone a partir de uma string
   * @param telefone - Número de telefone com ou sem formatação
   * @returns Result com Telefone válido ou erro de validação
   */
  static criar(telefone: string): Result<Telefone, ValidationError> {
    const telefoneLimpo = telefone.replace(/\D/g, "");

    if (!telefoneLimpo) {
      return Result.fail(
        ValidationError.semantico([
          {
            propriedade: "telefone",
            mensagem: "O telefone não pode estar vazio",
          },
        ])
      );
    }

    if (!this.TELEFONE_REGEX.test(telefoneLimpo)) {
      return Result.fail(
        ValidationError.semantico([
          {
            propriedade: "telefone",
            mensagem: `O telefone "${telefone}" é inválido. Deve conter 10 ou 11 dígitos`,
          },
        ])
      );
    }

    return Result.ok(new Telefone(telefoneLimpo));
  }

  /**
   * Reconstitui um Telefone a partir de dados já validados do banco de dados
   * Não realiza validação - use apenas para dados persistidos
   * @param telefone - Número de telefone sem formatação
   * @returns Instância de Telefone
   */
  static reconstituir(telefone: string): Telefone {
    return new Telefone(telefone.replace(/\D/g, ""));
  }

  /**
   * Retorna o telefone sem formatação (apenas números)
   * @returns Telefone no formato XXXXXXXXXXX ou XXXXXXXXXX
   */
  toString(): string {
    return this.valor;
  }

  /**
   * Retorna o telefone formatado
   * @returns Telefone no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
   */
  formatar(): string {
    if (this.valor.length === 11) {
      // Celular: (XX) XXXXX-XXXX
      return this.valor.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else {
      // Fixo: (XX) XXXX-XXXX
      return this.valor.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
  }

  /**
   * Retorna o telefone sem formatação
   * @returns Telefone apenas com números
   */
  getValor(): string {
    return this.valor;
  }

  /**
   * Retorna o DDD (código de área)
   * @returns DDD com 2 dígitos
   */
  getDDD(): string {
    return this.valor.substring(0, 2);
  }

  /**
   * Retorna o número sem o DDD
   * @returns Número sem DDD
   */
  getNumero(): string {
    return this.valor.substring(2);
  }

  /**
   * Verifica se é um número de celular (11 dígitos)
   * @returns true se for celular, false se for fixo
   */
  isCelular(): boolean {
    return this.valor.length === 11;
  }

  /**
   * Compara dois telefones
   * @param outro - Outro telefone para comparar
   * @returns true se forem iguais, false caso contrário
   */
  equals(outro: Telefone): boolean {
    return this.valor === outro.valor;
  }
}
