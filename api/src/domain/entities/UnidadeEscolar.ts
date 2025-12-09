export type UnidadeEscolarArgs = {
  readonly id: number;
  readonly nome: string;
  readonly email: string;
  readonly cnpj: string;
  readonly telefone1: string;
  readonly telefone2?: string | undefined;
  readonly escolaId: number;

  readonly endereco?:
    | {
        readonly rua?: string | undefined;
        readonly numero?: string | undefined;
        readonly cidade?: string | undefined;
        readonly estado?: string | undefined;
        readonly cep?: string | undefined;
        readonly pais?: string | undefined;
      }
    | undefined;

  readonly dataDeCriacao: Date;
};

export class UnidadeEscolar {
  readonly id: number;
  readonly nome: string;
  readonly email: string;
  readonly cnpj: string;
  readonly telefone1: string;
  readonly telefone2: string | null;
  readonly escolaId: number;

  readonly endereco: {
    readonly rua: string | null;
    readonly numero: string | null;
    readonly cidade: string | null;
    readonly estado: string | null;
    readonly cep: string | null;
    readonly pais: string | null;
  };

  readonly dataDeCriacao: Date;

  constructor(args: UnidadeEscolarArgs) {
    this.id = args.id;
    this.nome = args.nome;
    this.email = args.email;
    this.cnpj = args.cnpj;
    this.telefone1 = args.telefone1;
    this.telefone2 = args.telefone2 ?? null;
    this.escolaId = args.escolaId;
    this.endereco = {
      cidade: args.endereco?.cidade ?? null,
      rua: args.endereco?.rua ?? null,
      numero: args.endereco?.numero ?? null,
      estado: args.endereco?.estado ?? null,
      cep: args.endereco?.cep ?? null,
      pais: args.endereco?.pais ?? null,
    };
    this.dataDeCriacao = args.dataDeCriacao;
  }
}
