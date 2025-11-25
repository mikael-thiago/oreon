import { estaVazio } from "../../infra/utils/array.js";
import { IllegalArgumentError } from "../errors/IllegalArgumentError.js";
import { Disciplina } from "./Disciplina.js";

export type BaseCurricularArgs = {
  readonly id: number;
  readonly codigo: string;
  readonly dataCriacao: Date;
  readonly etapaId: number;
  readonly escolaId: number;
  readonly disciplinas: Disciplina[];
};

export class BaseCurricular {
  readonly id: number;
  readonly codigo: string;
  readonly etapaId: number;
  readonly escolaId: number;
  readonly dataCriacao: Date;
  readonly disciplinas: Disciplina[];

  constructor(args: BaseCurricularArgs) {
    this.id = args.id;
    this.codigo = args.codigo;
    this.dataCriacao = args.dataCriacao;
    this.etapaId = args.etapaId;
    this.escolaId = args.escolaId;
    this.disciplinas = [];

    if (estaVazio(args.disciplinas)) {
      throw new IllegalArgumentError(
        "A base curricular precisa ter pelo menos uma disciplina"
      );
    }

    for (const disciplina of args.disciplinas) {
      this.adicionarDisciplina(disciplina);
    }
  }

  adicionarDisciplina(novaDisciplina: Disciplina) {
    const disciplinaComMesmoExiste = this.disciplinas.some(
      (disciplina) => disciplina.nome === novaDisciplina.nome
    );

    if (disciplinaComMesmoExiste) {
      throw new IllegalArgumentError(
        `Já existe uma disciplina com o nome ${novaDisciplina.nome} na base ${this.codigo}!`
      );
    }

    this.disciplinas.push(novaDisciplina);
  }
}
