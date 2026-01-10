import { ValidationError } from "../errors/validation.error.js";
import { Result } from "../shared/result.js";

export interface EnderecoProps {
  readonly rua: string;
  readonly numero: string;
  readonly complemento?: string;
  readonly bairro: string;
  readonly cidade: string;
  readonly estado: string;
  readonly cep: string;
}

/**
 * Value Object que representa um endereço completo
 */
export class Endereco {
  private static readonly CEP_REGEX = /^\d{8}$/;
  private static readonly UF_VALIDAS = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ];

  private constructor(private readonly props: EnderecoProps) {}

  /**
   * Cria um Endereço a partir das propriedades
   * @param props - Propriedades do endereço
   * @returns Result com Endereço válido ou erro de validação
   */
  static criar(props: EnderecoProps): Result<Endereco, ValidationError> {
    const erros: Array<{ propriedade: string; mensagem: string }> = [];

    // Validar CEP
    const cepLimpo = props.cep.replace(/\D/g, "");
    if (!this.CEP_REGEX.test(cepLimpo)) {
      erros.push({
        propriedade: "cep",
        mensagem: "O CEP deve conter 8 dígitos",
      });
    }

    // Validar rua
    if (!props.rua || props.rua.trim().length === 0) {
      erros.push({
        propriedade: "rua",
        mensagem: "A rua não pode estar vazia",
      });
    }

    // Validar número
    if (!props.numero || props.numero.trim().length === 0) {
      erros.push({
        propriedade: "numero",
        mensagem: "O número não pode estar vazio",
      });
    }

    // Validar bairro
    if (!props.bairro || props.bairro.trim().length === 0) {
      erros.push({
        propriedade: "bairro",
        mensagem: "O bairro não pode estar vazio",
      });
    }

    // Validar cidade
    if (!props.cidade || props.cidade.trim().length === 0) {
      erros.push({
        propriedade: "cidade",
        mensagem: "A cidade não pode estar vazia",
      });
    }

    // Validar estado
    const estadoUpper = props.estado.toUpperCase();
    if (!this.UF_VALIDAS.includes(estadoUpper)) {
      erros.push({
        propriedade: "estado",
        mensagem: "O estado (UF) é inválido",
      });
    }

    if (erros.length > 0) {
      return Result.fail(ValidationError.semantico(erros));
    }

    return Result.ok(
      new Endereco({
        rua: props.rua.trim(),
        numero: props.numero.trim(),
        complemento: props.complemento?.trim() ?? "",
        bairro: props.bairro.trim(),
        cidade: props.cidade.trim(),
        estado: estadoUpper,
        cep: cepLimpo,
      })
    );
  }

  /**
   * Reconstitui um Endereço a partir de dados já validados do banco de dados
   * Não realiza validação - use apenas para dados persistidos
   * @param props - Propriedades do endereço
   * @returns Instância de Endereço
   */
  static reconstituir(props: EnderecoProps): Endereco {
    return new Endereco({
      ...props,
      cep: props.cep.replace(/\D/g, ""),
    });
  }

  /**
   * Retorna o endereço formatado como string
   * @returns Endereço completo formatado
   */
  toString(): string {
    const complemento = this.props.complemento ? `, ${this.props.complemento}` : "";
    return `${this.props.rua}, ${this.props.numero}${complemento} - ${this.props.bairro}, ${this.props.cidade}/${
      this.props.estado
    } - CEP: ${this.formatarCEP()}`;
  }

  /**
   * Retorna o CEP formatado
   * @returns CEP no formato XXXXX-XXX
   */
  formatarCEP(): string {
    return this.props.cep.replace(/(\d{5})(\d{3})/, "$1-$2");
  }

  /**
   * Retorna a rua
   */
  getRua(): string {
    return this.props.rua;
  }

  /**
   * Retorna o número
   */
  getNumero(): string {
    return this.props.numero;
  }

  /**
   * Retorna o complemento
   */
  getComplemento(): string | undefined {
    return this.props.complemento;
  }

  /**
   * Retorna o bairro
   */
  getBairro(): string {
    return this.props.bairro;
  }

  /**
   * Retorna a cidade
   */
  getCidade(): string {
    return this.props.cidade;
  }

  /**
   * Retorna o estado (UF)
   */
  getEstado(): string {
    return this.props.estado;
  }

  /**
   * Retorna o CEP sem formatação
   */
  getCEP(): string {
    return this.props.cep;
  }

  /**
   * Retorna todas as propriedades do endereço
   */
  getProps(): EnderecoProps {
    return { ...this.props };
  }

  /**
   * Compara dois endereços
   * @param outro - Outro endereço para comparar
   * @returns true se forem iguais, false caso contrário
   */
  equals(outro: Endereco): boolean {
    return (
      this.props.rua === outro.props.rua &&
      this.props.numero === outro.props.numero &&
      this.props.complemento === outro.props.complemento &&
      this.props.bairro === outro.props.bairro &&
      this.props.cidade === outro.props.cidade &&
      this.props.estado === outro.props.estado &&
      this.props.cep === outro.props.cep
    );
  }
}
