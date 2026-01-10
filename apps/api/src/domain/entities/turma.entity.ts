import { ValidationError } from "../errors/validation.error.js";
import { Result } from "../shared/result.js";

export type TurmaArgs = {
  readonly id: number;
  readonly anoLetivoId: number;
  readonly letra: string;
  readonly baseId: number;
  readonly modalidadeId: number;
  readonly etapaId: number;
  readonly limiteDeAlunos: number;
  readonly unidadeId: number;
};

export class Turma {
  readonly id: number;
  readonly letra: string;
  readonly anoLetivoId: number;
  readonly baseId: number;
  readonly modalidadeId: number;
  readonly etapaId: number;
  readonly limiteDeAlunos: number;
  readonly unidadeId: number;

  private constructor(args: TurmaArgs) {
    this.id = args.id;
    this.anoLetivoId = args.anoLetivoId;
    this.letra = args.letra;
    this.baseId = args.baseId;
    this.modalidadeId = args.modalidadeId;
    this.etapaId = args.etapaId;
    this.limiteDeAlunos = args.limiteDeAlunos;
    this.unidadeId = args.unidadeId;
  }

  static criar(dados: {
    readonly id: number;
    readonly anoLetivoId: number;
    readonly letra: string;
    readonly baseId: number;
    readonly modalidadeId: number;
    readonly etapaId: number;
    readonly limiteDeAlunos: number;
    readonly unidadeId: number;
  }): Result<Turma, ValidationError> {
    if (dados.limiteDeAlunos <= 0) {
      return Result.fail(
        ValidationError.semantico([
          { propriedade: "limiteDeAlunos", mensagem: "O limite de alunos deve ser maior do que 0" },
        ])
      );
    }

    return Result.ok(
      new Turma({
        id: dados.id,
        anoLetivoId: dados.anoLetivoId,
        letra: dados.letra,
        baseId: dados.baseId,
        modalidadeId: dados.modalidadeId,
        etapaId: dados.etapaId,
        limiteDeAlunos: dados.limiteDeAlunos,
        unidadeId: dados.unidadeId,
      })
    );
  }

  /**
   * Reconstitui uma turma a partir de dados já validados do banco de dados
   */
  static reconstituir(dados: {
    readonly id: number;
    readonly anoLetivoId: number;
    readonly letra: string;
    readonly baseId: number;
    readonly modalidadeId: number;
    readonly etapaId: number;
    readonly limiteDeAlunos: number;
    readonly unidadeId: number;
  }): Turma {
    return new Turma({
      id: dados.id,
      anoLetivoId: dados.anoLetivoId,
      letra: dados.letra,
      baseId: dados.baseId,
      modalidadeId: dados.modalidadeId,
      etapaId: dados.etapaId,
      limiteDeAlunos: dados.limiteDeAlunos,
      unidadeId: dados.unidadeId,
    });
  }
}
