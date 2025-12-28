export type TurmaArgs = {
  readonly id: number;
  readonly anoLetivoId: number;
  readonly letra: string;
  readonly baseId: number;
  readonly modalidadeId: number;
  readonly etapaId: number;
  readonly limiteDeAlunos: number;
};

export class Turma {
  readonly id: number;
  readonly letra: string;
  readonly anoLetivoId: number;
  readonly baseId: number;
  readonly modalidadeId: number;
  readonly etapaId: number;
  readonly limiteDeAlunos: number;

  constructor(args: TurmaArgs) {
    this.id = args.id;
    this.anoLetivoId = args.anoLetivoId;
    this.letra = args.letra;
    this.baseId = args.baseId;
    this.modalidadeId = args.modalidadeId;
    this.etapaId = args.etapaId;
    this.limiteDeAlunos = args.limiteDeAlunos;
  }
}
