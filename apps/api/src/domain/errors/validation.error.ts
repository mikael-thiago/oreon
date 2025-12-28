export type ValidationErrorItem = { readonly propriedade: string; readonly mensagem: string };
export type ValidationErrorStatuses = 400 | 422;

export class ValidationError extends Error {
  readonly type = "validation-error" as const;
  readonly status: ValidationErrorStatuses;
  readonly erros: ValidationErrorItem[];

  private constructor(status: ValidationErrorStatuses, erros: ValidationErrorItem[]) {
    super();

    this.status = status;
    this.erros = erros;
  }

  static semantico(erros: ValidationErrorItem[]) {
    return new ValidationError(422, erros);
  }

  static sintatico(erros: ValidationErrorItem[]) {
    return new ValidationError(400, erros);
  }
}
