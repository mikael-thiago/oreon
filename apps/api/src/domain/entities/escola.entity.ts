export type UnidadeMatrizVO = {
  readonly id: number;
  readonly nome: string;
  readonly email: string;
  readonly cnpj: string;
  readonly telefone1: string;
  readonly telefone2: string | null;
  readonly escolaId: number;

  readonly endereco:
    | {
        readonly rua: string | null;
        readonly numero: string | null;
        readonly cidade: string | null;
        readonly estado: string | null;
        readonly cep: string | null;
        readonly pais: string | null;
      };

  readonly dataDeCriacao: Date;
};

export type EscolaArgs = {
  readonly id: number;
  readonly nome: string;
  readonly email: string;
  readonly cnpj?: string;
  readonly matriz: UnidadeMatrizVO;
  readonly dataDeCriacao: Date;
};

export class Escola {
  readonly id: number;
  readonly nome: string;
  readonly email: string;
  readonly matriz: UnidadeMatrizVO;
  readonly dataDeCriacao: Date;

  constructor(args: EscolaArgs) {
    this.id = args.id;
    this.nome = args.nome;
    this.email = args.email;
    this.matriz = args.matriz;
    this.dataDeCriacao = args.dataDeCriacao;
  }
}
