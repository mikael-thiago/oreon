export class UnauthorizedError extends Error {
  readonly type = "unauthorized";
  readonly status = 401;

  constructor(mensagem: string) {
    super(mensagem);
  }
}
