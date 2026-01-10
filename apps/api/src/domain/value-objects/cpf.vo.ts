import { cpfEhValido as validarCPF, formatarCPF, limparCPF } from "@oreon/utils/cpf";
import { Result } from "../shared/result.js";
import { ValidationError } from "../errors/validation.error.js";
import { IllegalArgumentError } from "../errors/illegal-argument.error.js";

/**
 * Value Object que representa um CPF (Cadastro de Pessoa Física) brasileiro
 * Garante que apenas CPFs válidos possam ser criados
 */
export class CPF {
  private constructor(private readonly valor: string) {}

  /**
   * Cria um CPF a partir de uma string
   * @param cpf - CPF com ou sem formatação
   * @returns Result com CPF válido ou erro de validação
   */
  static criar(cpf: string): Result<CPF, IllegalArgumentError> {
    const cpfLimpo = limparCPF(cpf);

    if (!validarCPF(cpfLimpo)) {
      return Result.fail(new IllegalArgumentError(`O CPF ${cpf} é inválido`));
    }

    return Result.ok(new CPF(cpfLimpo));
  }

  /**
   * Reconstitui um CPF a partir de dados já validados do banco de dados
   * Não realiza validação - use apenas para dados persistidos
   * @param cpf - CPF sem formatação (apenas números)
   * @returns Instância de CPF
   */
  static reconstituir(cpf: string): CPF {
    return new CPF(limparCPF(cpf));
  }

  /**
   * Retorna o CPF sem formatação (apenas números)
   * @returns CPF no formato XXXXXXXXXXX
   */
  toString(): string {
    return this.valor;
  }

  /**
   * Retorna o CPF formatado
   * @returns CPF no formato XXX.XXX.XXX-XX
   */
  formatar(): string {
    return formatarCPF(this.valor);
  }

  /**
   * Retorna o CPF sem formatação (apenas números)
   * @returns CPF no formato XXXXXXXXXXX
   */
  getValor(): string {
    return this.valor;
  }

  /**
   * Compara dois CPFs
   * @param outro - Outro CPF para comparar
   * @returns true se forem iguais, false caso contrário
   */
  equals(outro: CPF): boolean {
    return this.valor === outro.valor;
  }
}
