type DisciplinaArgs = {
  readonly id: number;
  readonly nome: string;
  readonly slug: string;
  readonly unidadeId?: number | null;
};

export class Disciplina {
  readonly id: number;
  readonly nome: string;
  readonly slug: string;
  readonly unidadeId: number | null;

  constructor(args: DisciplinaArgs) {
    this.id = args.id;
    this.nome = args.nome;
    this.slug = args.slug;
    this.unidadeId = args.unidadeId ?? null;
  }
}
