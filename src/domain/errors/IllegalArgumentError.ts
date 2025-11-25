export class IllegalArgumentError extends Error {
  readonly type = "illegal-argument";
  readonly status = 400;

  constructor(mensagem: string) {
    super(mensagem);
  }
}
