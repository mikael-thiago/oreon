import { deduplicate } from "@oreon/utils/array";
import type { StatusContrato } from "../enums/status-contrato.enum.js";
import { Dinheiro } from "../value-objects/dinheiro.vo.js";
import { Result } from "../shared/result.js";
import { ValidationError } from "../errors/validation.error.js";

export interface Contrato {
  readonly id: number;
  readonly dataInicio: Date;
  readonly dataFim: Date | null;
  readonly cargoId: number;
  readonly unidadeId: number;
  readonly colaboradorId: number;
  readonly matricula: string;
  readonly salario: Dinheiro;
  readonly status: StatusContrato;
}

export type ContratoComumProps = {
  readonly id: number;
  readonly dataInicio: Date;
  readonly dataFim: Date | null;
  readonly cargoId: number;
  readonly unidadeId: number;
  readonly colaboradorId: number;
  readonly matricula: string;
  readonly status: StatusContrato;
  readonly salario: Dinheiro;
};

export type CriarContratoComumDTO = {
  readonly id: number;
  readonly dataInicio: Date;
  readonly dataFim?: Date | null;
  readonly cargoId: number;
  readonly unidadeId: number;
  readonly colaboradorId: number;
  readonly matricula: string;
  readonly status: StatusContrato;
  readonly salario: number;
};

/**
 * Contrato Comum - representa um contrato de trabalho padrão
 */
export class ContratoComum implements Contrato {
  readonly id: number;
  private props: ContratoComumProps;

  private constructor(props: ContratoComumProps) {
    this.id = props.id;
    this.props = props;
  }

  /**
   * Cria um novo contrato comum com validações de negócio
   * @param dados - Dados para criar o contrato
   * @returns Result com ContratoComum válido ou erro de validação
   */
  static criar(dados: CriarContratoComumDTO): Result<ContratoComum, ValidationError> {
    const erros: Array<{ propriedade: string; mensagem: string }> = [];

    // Validar salário
    const salarioResult = Dinheiro.criar(dados.salario, undefined, "salario");
    if (Result.isFailure(salarioResult)) {
      return Result.fail(salarioResult.erro);
    }

    // Validar datas
    if (dados.dataFim && dados.dataFim < dados.dataInicio) {
      erros.push({
        propriedade: "dataFim",
        mensagem: "Data de término não pode ser anterior à data de início",
      });
    }

    // if (dados.dataInicio > new Date()) {
    //   erros.push({
    //     propriedade: "dataInicio",
    //     mensagem: "Data de início não pode ser no futuro",
    //   });
    // }

    if (erros.length > 0) {
      return Result.fail(ValidationError.semantico(erros));
    }

    return Result.ok(
      new ContratoComum({
        id: dados.id,
        dataInicio: dados.dataInicio,
        dataFim: dados.dataFim ?? null,
        cargoId: dados.cargoId,
        unidadeId: dados.unidadeId,
        colaboradorId: dados.colaboradorId,
        matricula: dados.matricula,
        status: dados.status,
        salario: salarioResult.value,
      })
    );
  }

  /**
   * Reconstitui um contrato a partir de dados já validados do banco de dados
   * @param dados - Dados do contrato do banco de dados (salario como número)
   * @returns Instância de ContratoComum
   */
  static reconstituir(dados: {
    readonly id: number;
    readonly dataInicio: Date;
    readonly dataFim: Date | null;
    readonly cargoId: number;
    readonly unidadeId: number;
    readonly colaboradorId: number;
    readonly matricula: string;
    readonly status: StatusContrato;
    readonly salario: number;
  }): ContratoComum {
    return new ContratoComum({
      ...dados,
      salario: Dinheiro.reconstituir(dados.salario),
    });
  }

  // Getters
  get dataInicio(): Date {
    return this.props.dataInicio;
  }

  get dataFim(): Date | null {
    return this.props.dataFim;
  }

  get cargoId(): number {
    return this.props.cargoId;
  }

  get unidadeId(): number {
    return this.props.unidadeId;
  }

  get matricula(): string {
    return this.props.matricula;
  }

  get status(): StatusContrato {
    return this.props.status;
  }

  get salario(): Dinheiro {
    return this.props.salario;
  }

  get salarioValor(): number {
    return this.props.salario.getValor();
  }

  get salarioFormatado(): string {
    return this.props.salario.formatar();
  }

  get colaboradorId(): number {
    return this.props.colaboradorId;
  }
}

export type ContratoProfessorProps = {
  readonly id: number;
  readonly dataInicio: Date;
  readonly dataFim: Date | null;
  readonly cargoId: number;
  readonly unidadeId: number;
  readonly colaboradorId: number;
  readonly matricula: string;
  readonly status: StatusContrato;
  readonly salario: Dinheiro;
  readonly disciplinas: { readonly disciplinaId: number; readonly etapaId: number }[];
};

export type CriarContratoProfessorDTO = {
  readonly id: number;
  readonly dataInicio: Date;
  readonly dataFim?: Date | null;
  readonly cargoId: number;
  readonly unidadeId: number;
  readonly colaboradorId: number;
  readonly matricula: string;
  readonly status: StatusContrato;
  readonly salario: number;
  readonly disciplinas: { readonly disciplinaId: number; readonly etapaId: number }[];
};

/**
 * Contrato Professor - representa um contrato de professor com disciplinas associadas
 */
export class ContratoProfessor implements Contrato {
  readonly id: number;
  private props: ContratoProfessorProps;

  private constructor(props: ContratoProfessorProps) {
    this.id = props.id;
    this.props = props;
  }

  /**
   * Cria um novo contrato de professor com validações de negócio
   * @param dados - Dados para criar o contrato
   * @returns Result com ContratoProfessor válido ou erro de validação
   */
  static criar(dados: CriarContratoProfessorDTO): Result<ContratoProfessor, ValidationError> {
    const erros: Array<{ propriedade: string; mensagem: string }> = [];

    // Validar salário
    const salarioResult = Dinheiro.criar(dados.salario, undefined, "salario");
    if (Result.isFailure(salarioResult)) {
      return Result.fail(salarioResult.erro);
    }

    // Validar datas
    if (dados.dataFim && dados.dataFim < dados.dataInicio) {
      erros.push({
        propriedade: "dataFim",
        mensagem: "Data de término não pode ser anterior à data de início",
      });
    }

    // if (dados.dataInicio > new Date()) {
    //   erros.push({
    //     propriedade: "dataInicio",
    //     mensagem: "Data de início não pode ser no futuro",
    //   });
    // }

    // Validar disciplinas
    if (dados.disciplinas.length === 0) {
      erros.push({
        propriedade: "disciplinas",
        mensagem: "O professor deve ter pelo menos uma disciplina associada",
      });
    }

    if (erros.length > 0) {
      return Result.fail(ValidationError.semantico(erros));
    }

    return Result.ok(
      new ContratoProfessor({
        id: dados.id,
        dataInicio: dados.dataInicio,
        dataFim: dados.dataFim ?? null,
        cargoId: dados.cargoId,
        unidadeId: dados.unidadeId,
        colaboradorId: dados.colaboradorId,
        matricula: dados.matricula,
        status: dados.status,
        salario: salarioResult.value,
        disciplinas: deduplicate(dados.disciplinas, (d) => `${d.etapaId}.${d.disciplinaId}`),
      })
    );
  }

  /**
   * Reconstitui um contrato de professor a partir de dados já validados do banco de dados
   * @param dados - Dados do contrato do banco de dados (salario como número)
   * @returns Instância de ContratoProfessor
   */
  static reconstituir(dados: {
    readonly id: number;
    readonly dataInicio: Date;
    readonly dataFim: Date | null;
    readonly cargoId: number;
    readonly unidadeId: number;
    readonly colaboradorId: number;
    readonly matricula: string;
    readonly status: StatusContrato;
    readonly salario: number;
    readonly disciplinas: { readonly disciplinaId: number; readonly etapaId: number }[];
  }): ContratoProfessor {
    return new ContratoProfessor({
      ...dados,
      salario: Dinheiro.reconstituir(dados.salario),
    });
  }

  // Getters
  get dataInicio(): Date {
    return this.props.dataInicio;
  }

  get dataFim(): Date | null {
    return this.props.dataFim;
  }

  get cargoId(): number {
    return this.props.cargoId;
  }

  get unidadeId(): number {
    return this.props.unidadeId;
  }

  get matricula(): string {
    return this.props.matricula;
  }

  get status(): StatusContrato {
    return this.props.status;
  }

  get salario(): Dinheiro {
    return this.props.salario;
  }

  get salarioValor(): number {
    return this.props.salario.getValor();
  }

  get salarioFormatado(): string {
    return this.props.salario.formatar();
  }

  get disciplinas(): { readonly disciplinaId: number; readonly etapaId: number }[] {
    return this.props.disciplinas;
  }

  get colaboradorId(): number {
    return this.props.colaboradorId;
  }
}
