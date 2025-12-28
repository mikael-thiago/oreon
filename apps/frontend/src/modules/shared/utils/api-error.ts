import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type {
  ApiError,
  ConflictError,
  ForbiddenError,
  IllegalArgumentError,
  UnauthorizedError,
  ValidationError,
} from "../types/backend-error";

/**
 * Verifica se o erro é um ValidationError
 */
export function isValidationError(error: ApiError): error is ValidationError {
  return error.type === "validation-error";
}

/**
 * Verifica se o erro é um UnauthorizedError
 */
export function isUnauthorizedError(
  error: ApiError
): error is UnauthorizedError {
  return error.type === "unauthorized";
}

/**
 * Verifica se o erro é um ForbiddenError
 */
export function isForbiddenError(error: ApiError): error is ForbiddenError {
  return error.type === "forbidden";
}

/**
 * Verifica se o erro é um IllegalArgumentError
 */
export function isIllegalArgumentError(
  error: ApiError
): error is IllegalArgumentError {
  return error.type === "illegal-argument";
}

/**
 * Verifica se o erro é um ConflictError
 */
export function isConflictError(error: ApiError): error is ConflictError {
  return error.type === "conflict";
}

/**
 * Define os erros de validação do formulário com base nos erros retornados pelo backend
 * @param error - O erro retornado pela API
 * @param setError - A função setError do react-hook-form
 * @param validFields - Array opcional de nomes de campos válidos para filtrar os erros
 */
export function setFormValidationErrors<TFieldValues extends FieldValues>(
  error: ApiError,
  setError: UseFormSetError<TFieldValues>,
  validFields?: readonly (keyof TFieldValues)[]
): void {
  if (!isValidationError(error)) {
    return;
  }

  for (const erro of error.erros) {
    const field = erro.propriedade as Path<TFieldValues>;

    // Se validFields for fornecido, define apenas os erros para campos válidos
    if (validFields && !validFields.includes(field as keyof TFieldValues)) {
      return;
    }

    setError(field, {
      message: erro.mensagem,
    });
  }
}
