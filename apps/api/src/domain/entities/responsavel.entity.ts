export type ResponsavelArgs = {
  readonly id: number;
  readonly nome: string;
  readonly cpf: string;
  readonly telefone: string;
  readonly email: string;
  readonly dataDeNascimento: Date;
};

export class Responsavel {
  readonly id: number;
  readonly nome: string;
  readonly cpf: string;
  readonly telefone: string;
  readonly email: string;
  readonly dataDeNascimento: Date;

  constructor(args: ResponsavelArgs) {
    this.id = args.id;
    this.nome = args.nome;
    this.cpf = args.cpf;
    this.telefone = args.telefone;
    this.email = args.email;
    this.dataDeNascimento = args.dataDeNascimento;
  }
}
