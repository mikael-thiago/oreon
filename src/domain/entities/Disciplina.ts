type DisciplinaArgs = {
  readonly id?: number;
  readonly nome: string;
  readonly codigo: string;
  readonly cargaHorariaAnual: number;
};

export class Disciplina {
  private _id: number | null;
  readonly nome: string;
  readonly codigo: string;
  // Horas
  readonly cargaHorariaAnual: number;

  constructor(args: DisciplinaArgs) {
    this._id = args.id ?? null;
    this.nome = args.nome;
    this.codigo = args.codigo;
    this.cargaHorariaAnual = args.cargaHorariaAnual;
  }

  setId(id: number) {
    this._id = id;
  }

  getId() {
    return this._id;
  }

  toJSON() {
    return {
      id: this._id,
      nome: this.nome,
      codigo: this.codigo,
      cargaHorariaAnual: this.cargaHorariaAnual,
    };
  }
}
