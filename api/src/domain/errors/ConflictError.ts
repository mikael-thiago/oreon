export class ConflictError extends Error {
  readonly type = "conflict";
  readonly status = 409;

  constructor(mensagem: string) {
    super(mensagem);
  }
}
