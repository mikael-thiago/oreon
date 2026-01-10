import { Result } from "../shared/result.js";
import { ValidationError } from "../errors/validation.error.js";

/**
 * Value Object que representa um endereço de e-mail
 * Garante que apenas e-mails válidos possam ser criados
 */
export class Email {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(private readonly valor: string) {}

  /**
   * Cria um Email a partir de uma string
   * @param email - Endereço de e-mail
   * @returns Result com Email válido ou erro de validação
   */
  static criar(email: string): Result<Email, ValidationError> {
    const emailLimpo = email.trim().toLowerCase();

    if (!emailLimpo) {
      return Result.fail(
        ValidationError.semantico([
          {
            propriedade: "email",
            mensagem: "O e-mail não pode estar vazio",
          },
        ])
      );
    }

    if (!this.EMAIL_REGEX.test(emailLimpo)) {
      return Result.fail(
        ValidationError.semantico([
          {
            propriedade: "email",
            mensagem: `O e-mail "${email}" é inválido`,
          },
        ])
      );
    }

    if (emailLimpo.length > 255) {
      return Result.fail(
        ValidationError.semantico([
          {
            propriedade: "email",
            mensagem: "O e-mail não pode ter mais de 255 caracteres",
          },
        ])
      );
    }

    return Result.ok(new Email(emailLimpo));
  }

  /**
   * Reconstitui um Email a partir de dados já validados do banco de dados
   * Não realiza validação - use apenas para dados persistidos
   * @param email - Endereço de e-mail
   * @returns Instância de Email
   */
  static reconstituir(email: string): Email {
    return new Email(email.trim().toLowerCase());
  }

  /**
   * Retorna o endereço de e-mail
   * @returns E-mail em lowercase
   */
  toString(): string {
    return this.valor;
  }

  /**
   * Retorna o endereço de e-mail
   * @returns E-mail em lowercase
   */
  getValor(): string {
    return this.valor;
  }

  /**
   * Retorna o domínio do e-mail
   * @returns Domínio (ex: gmail.com)
   */
  getDominio(): string {
    return this.valor.split("@")[1]!;
  }

  /**
   * Retorna a parte local do e-mail (antes do @)
   * @returns Parte local do e-mail
   */
  getLocal(): string {
    return this.valor.split("@")[0]!;
  }

  /**
   * Compara dois e-mails
   * @param outro - Outro e-mail para comparar
   * @returns true se forem iguais, false caso contrário
   */
  equals(outro: Email): boolean {
    return this.valor === outro.valor;
  }
}
