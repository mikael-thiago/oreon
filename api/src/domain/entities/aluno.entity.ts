export type AlunoArgs = {
  readonly id: number;
  readonly nome: string;
  readonly cpf: string;
  readonly dataDeNascimento: Date;
};

export class Aluno {
  readonly id: number;
  readonly nome: string;
  readonly cpf: string;
  readonly dataDeNascimento: Date;

  constructor(args: AlunoArgs) {
    this.id = args.id;
    this.nome = args.nome;
    this.cpf = args.cpf;
    this.dataDeNascimento = args.dataDeNascimento;
  }
}
