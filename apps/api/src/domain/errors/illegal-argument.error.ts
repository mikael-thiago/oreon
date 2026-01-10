export class IllegalArgumentError extends Error {
  readonly type = "illegal-argument";
  readonly status = 422;
  readonly mensagem: string;

  constructor(mensagem: string) {
    super(mensagem);
    
    this.mensagem = mensagem;
  }
}
