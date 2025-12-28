import type { Sexo } from "../enums/sexo.enum.js";

export type AlunoArgs = {
  readonly id: number;
  readonly nome: string;
  readonly cpf: string;
  readonly dataDeNascimento: Date;
  readonly sexo: Sexo;
};

export class Aluno {
  readonly id: number;
  readonly nome: string;
  readonly cpf: string;
  readonly dataDeNascimento: Date;
  readonly sexo: Sexo;

  constructor(args: AlunoArgs) {
    this.id = args.id;
    this.nome = args.nome;
    this.cpf = args.cpf;
    this.dataDeNascimento = args.dataDeNascimento;
    this.sexo = args.sexo;
  }
}
