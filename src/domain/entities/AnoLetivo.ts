export type AnoLetivoArgs = {
  readonly id: number;
  readonly anoReferencia: number;
  readonly dataInicio: Date;
  readonly dataFim: Date;
  readonly escolaId: number;
};

export class AnoLetivo {
  readonly id: number;
  readonly ano: number;
  readonly dataInicio: Date;
  readonly dataFim: Date;
  readonly escolaId: number;

  constructor(args: AnoLetivoArgs) {
    this.id = args.id;
    this.ano = args.anoReferencia;
    this.dataInicio = args.dataInicio;
    this.dataFim = args.dataFim;
    this.escolaId = args.escolaId;
  }
}
