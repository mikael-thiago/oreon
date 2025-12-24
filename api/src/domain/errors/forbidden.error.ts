export class ForbiddenError extends Error {
  readonly type = "forbidden";
  readonly status = 403;

  constructor(mensagem: string) {
    super(mensagem);
  }
}
