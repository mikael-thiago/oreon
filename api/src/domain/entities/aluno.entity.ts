export type AlunoArgs = {
  readonly id: number;
  readonly nome: string;
  readonly cpf: string;
};

export class Aluno {
  readonly id: number;
  readonly nome: string;
  readonly cpf: string;

  constructor(args: AlunoArgs) {
    this.id = args.id;
    this.nome = args.nome;
    this.cpf = args.cpf;
  }
}
