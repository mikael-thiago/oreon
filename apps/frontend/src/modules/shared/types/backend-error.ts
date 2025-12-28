export type UnauthorizedError = {
  readonly type: "unauthorized";
  readonly status: 401;
  readonly mensagem: string;
};

export type ForbiddenError = {
  readonly type: "forbidden";
  readonly status: 403;
  readonly mensagem: string;
};

export type IllegalArgumentError = {
  readonly type: "illegal-argument";
  readonly status: 422;
  readonly mensagem: string;
};

export type ConflictError = {
  readonly type: "conflict";
  readonly status: 409;
  readonly mensagem: string;
};

export type ValidationError = {
  readonly type: "validation-error";
  readonly status: 400 | 422;
  readonly erros: Array<{
    readonly propriedade: string;
    readonly mensagem?: string;
  }>;
};

export type ApiError =
  | UnauthorizedError
  | ForbiddenError
  | IllegalArgumentError
  | ConflictError
  | ValidationError;
