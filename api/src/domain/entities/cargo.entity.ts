export type CargoArgs = {
  readonly id: number;
  readonly nome: string;
  readonly podeEnsinar: boolean;
};

export class Cargo {
  readonly id: number;
  readonly nome: string;
  readonly podeEnsinar: boolean;

  constructor(args: CargoArgs) {
    this.id = args.id;
    this.nome = args.nome;
    this.podeEnsinar = args.podeEnsinar;
  }
}
