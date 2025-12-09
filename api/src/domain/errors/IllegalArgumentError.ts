export class IllegalArgumentError extends Error {
  readonly type = "illegal-argument";
  readonly status = 422;

  constructor(mensagem: string) {
    super(mensagem);
  }
}
