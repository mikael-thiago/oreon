export type UsuarioArgs = {
  readonly id: number;
  readonly nome: string;
  readonly login: string;
  readonly senha: string;
  readonly escolaId: number;
  readonly admin: boolean;
  readonly root: boolean;
};

export class Usuario {
  readonly id: number;
  readonly nome: string;
  readonly login: string;
  readonly senha: string;
  readonly escolaId: number;
  readonly admin: boolean;
  readonly root: boolean;

  constructor(args: UsuarioArgs) {
    this.id = args.id;
    this.nome = args.nome;
    this.login = args.login;
    this.senha = args.senha;
    this.escolaId = args.escolaId;
    this.admin = args.admin;
    this.root = args.root;
  }
}