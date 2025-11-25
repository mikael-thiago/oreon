export type TurmaArgs = {
  readonly id: number;
  readonly anoLetivoId: number;
  readonly letra: string;
};

export class Turma {
  readonly id: number;
  readonly letra: string;
  readonly anoLetivoId: number;

  constructor(args: TurmaArgs) {
    this.id = args.id;
    this.anoLetivoId = args.anoLetivoId;
    this.letra = args.letra;
  }
}
