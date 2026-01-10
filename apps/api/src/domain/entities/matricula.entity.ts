import type { StatusMatricula } from "../enums/status-matricula.enum.js";
import { StatusMatriculaEnum } from "../enums/status-matricula.enum.js";
import { Result } from "../shared/result.js";
import { ValidationError } from "../errors/validation.error.js";

export type MatriculaProps = {
  readonly id: number;
  readonly unidadeId: number;
  readonly estudanteId: number;
  readonly periodoLetivoId: number;
  readonly status: StatusMatricula;
  readonly dataCriacao: Date;
  readonly comprovanteResidenciaId: number;
  readonly historicoEscolarId: number;
};

export type CriarMatriculaDTO = {
  readonly id: number;
  readonly unidadeId: number;
  readonly estudanteId: number;
  readonly periodoLetivoId: number;
  readonly status?: StatusMatricula;
  readonly dataCriacao?: Date;
  readonly comprovanteResidenciaId: number;
  readonly historicoEscolarId: number;
};

/**
 * Entidade Matricula - representa a matrícula de um estudante
 * Rich domain model com regras de negócio encapsuladas
 */
export class Matricula {
  readonly id: number;
  private props: MatriculaProps;

  private constructor(props: MatriculaProps) {
    this.id = props.id;
    this.props = props;
  }

  /**
   * Cria uma nova matrícula com validações de negócio
   * @param dados - Dados para criar a matrícula
   * @returns Result com Matricula válida ou erro de validação
   */
  static criar(dados: CriarMatriculaDTO): Result<Matricula, ValidationError> {
    const erros: Array<{ propriedade: string; mensagem: string }> = [];

    // Validar que data de criação não é no futuro
    const dataCriacao = dados.dataCriacao ?? new Date();
    if (dataCriacao > new Date()) {
      erros.push({
        propriedade: "dataCriacao",
        mensagem: "Data de criação não pode ser no futuro",
      });
    }

    if (erros.length > 0) {
      return Result.fail(ValidationError.semantico(erros));
    }

    return Result.ok(
      new Matricula({
        id: dados.id,
        unidadeId: dados.unidadeId,
        estudanteId: dados.estudanteId,
        periodoLetivoId: dados.periodoLetivoId,
        status: dados.status ?? StatusMatriculaEnum.Ativa,
        dataCriacao: dataCriacao,
        comprovanteResidenciaId: dados.comprovanteResidenciaId,
        historicoEscolarId: dados.historicoEscolarId,
      })
    );
  }

  /**
   * Reconstitui uma matrícula a partir de dados já validados do banco de dados
   * Não realiza validação - use apenas para dados persistidos
   * @param dados - Dados da matrícula do banco de dados
   * @returns Instância de Matricula
   */
  static reconstituir(dados: MatriculaProps): Matricula {
    return new Matricula(dados);
  }

  /**
   * Ativa a matrícula
   */
  ativar(): void {
    this.props = { ...this.props, status: StatusMatriculaEnum.Ativa };
  }

  /**
   * Cancela a matrícula
   */
  cancelar(): void {
    this.props = { ...this.props, status: StatusMatriculaEnum.Cancelada };
  }

  /**
   * Suspende a matrícula
   */
  suspender(): void {
    this.props = { ...this.props, status: StatusMatriculaEnum.Inativa };
  }

  /**
   * Verifica se a matrícula está ativa
   */
  isAtiva(): boolean {
    return this.props.status === StatusMatriculaEnum.Ativa;
  }

  /**
   * Verifica se a matrícula está cancelada
   */
  isCancelada(): boolean {
    return this.props.status === StatusMatriculaEnum.Cancelada;
  }

  /**
   * Verifica se a matrícula está suspensa
   */
  isSuspensa(): boolean {
    return this.props.status === StatusMatriculaEnum.Inativa;
  }

  // Getters para acessar propriedades
  get unidadeId(): number {
    return this.props.unidadeId;
  }

  get estudanteId(): number {
    return this.props.estudanteId;
  }

  get periodoLetivoId(): number {
    return this.props.periodoLetivoId;
  }

  get status(): StatusMatricula {
    return this.props.status;
  }

  get dataCriacao(): Date {
    return this.props.dataCriacao;
  }

  get comprovanteResidenciaId(): number {
    return this.props.comprovanteResidenciaId;
  }

  get historicoEscolarId(): number {
    return this.props.historicoEscolarId;
  }
}
