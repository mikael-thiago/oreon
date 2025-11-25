export type UsuarioArgs = {
  readonly id: number;
  readonly nome: string;
  readonly email: string;
  readonly senha: string;
  readonly telefone?: string | undefined;
  readonly escolaId: number;
};

export class Usuario {
  readonly id: number;
  readonly nome: string;
  readonly email: string;
  readonly senha: string;
  readonly telefone?: string | undefined;
  readonly escolaId: number;

  constructor(args: UsuarioArgs) {
    this.id = args.id;
    this.nome = args.nome;
    this.email = args.email;
    this.senha = args.senha;
    this.telefone = args.telefone;
    this.escolaId = args.escolaId;
  }
}
