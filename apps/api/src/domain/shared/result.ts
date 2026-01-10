export const ResultTypeEnum = {
  Sucesso: "sucesso",
  Erro: "erro",
} as const;

export type OkResult<T> = { readonly type: typeof ResultTypeEnum.Sucesso; readonly value: T };
export type FailResult<E> = { readonly type: typeof ResultTypeEnum.Erro; readonly erro: E };

export type Result<T, E = Error> = OkResult<T> | FailResult<E>;

export namespace Result {
  export function ok<T, E = Error>(value: T): Result<T, E> {
    return { type: ResultTypeEnum.Sucesso, value };
  }

  export function fail<T = never, E = Error>(erro: E): Result<T, E> {
    return { type: ResultTypeEnum.Erro, erro };
  }

  export function isResult(object: unknown): object is Result<unknown, unknown> {
    return (
      object !== null &&
      typeof object === "object" &&
      "type" in object &&
      typeof object.type === "string" &&
      [ResultTypeEnum.Erro, ResultTypeEnum.Sucesso].includes(object.type as any) &&
      ("value" in object || "erro" in object)
    );
  }

  /**
   * Type guard to check if Result is successful
   * @returns true if successful, false otherwise
   */
  export function isOk<T, E = Error>(result: Result<T, E>): result is OkResult<T> {
    return result.type === ResultTypeEnum.Sucesso;
  }

  /**
   * Type guard to check if Result is failed
   * @returns true if failed, false otherwise
   */
  export function isFailure<T, E = Error>(result: Result<T, E>): result is FailResult<E> {
    return result.type === ResultTypeEnum.Erro;
  }

  /**
   * Combines multiple Results into a single Result
   * If all are successful, returns ok with array of values
   * If any fails, returns the first failure
   * @param results Array of Results to combine
   * @returns Combined Result
   */
  export function combine<T, E>(results: Result<T, E>[]): Result<T[], E> {
    const values: T[] = [];

    for (const result of results) {
      if (Result.isOk(result)) {
        values.push(result.value);
      }

      if (Result.isFailure(result)) {
        return Result.fail(result.erro);
      }
    }

    return Result.ok(values);
  }

  /**
   * Wraps a function that might throw in a Result
   * @param fn Function that might throw
   * @returns Result containing the return value or error
   */
  export function tryCatch<T>(fn: () => T): Result<T, Error> {
    try {
      return Result.ok(fn());
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Wraps an async function that might throw in a Result
   * @param fn Async function that might throw
   * @returns Promise of Result containing the return value or error
   */
  export async function tryCatchAsync<T>(fn: () => Promise<T>): Promise<Result<T, Error>> {
    try {
      const value = await fn();
      return Result.ok(value);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error(String(error)));
    }
  }

  export function map<T, U, E = Error>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
    if (Result.isOk(result)) {
      return Result.ok(fn(result.value));
    }

    return result;
  }
}
/**
 * Result type for Railway Oriented Programming
 * Represents the result of an operation that can either succeed or fail
 * @template T The type of the success value
 * @template E The type of the error (defaults to Error)
 */
export class LegacyResult<T, E = Error> {
  private constructor(private readonly _isSuccess: boolean, private readonly _value?: T, private readonly _error?: E) {}

  /**
   * Creates a successful Result
   * @param value The success value
   * @returns A successful Result containing the value
   */
  static ok<T, E = Error>(value: T): LegacyResult<T, E> {
    return new LegacyResult<T, E>(true, value, undefined);
  }

  /**
   * Creates a failed Result
   * @param error The error
   * @returns A failed Result containing the error
   */
  static fail<T = never, E = Error>(error: E): LegacyResult<T, E> {
    return new LegacyResult<T, E>(false, undefined, error);
  }

  /**
   * Type guard to check if Result is successful
   * @returns true if successful, false otherwise
   */
  isOk(): this is { readonly value: T } {
    return this._isSuccess;
  }

  /**
   * Type guard to check if Result is failed
   * @returns true if failed, false otherwise
   */
  isFailure(): this is { readonly error: E } {
    return !this._isSuccess;
  }

  /**
   * Gets the success value
   * @throws Error if Result is failed
   * @returns The success value
   */
  get value(): T {
    if (!this._isSuccess) {
      throw new Error("Cannot get value from failed Result");
    }
    return this._value!;
  }

  /**
   * Gets the error
   * @throws Error if Result is successful
   * @returns The error
   */
  get error(): E {
    if (this._isSuccess) {
      throw new Error("Cannot get error from successful Result");
    }
    return this._error!;
  }

  /**
   * Maps the success value to a new type
   * @param fn Function to transform the value
   * @returns A new LegacyResult with the transformed value
   */
  map<U>(fn: (value: T) => U): LegacyResult<U, E> {
    if (this._isSuccess) {
      return LegacyResult.ok(fn(this._value!));
    }
    return LegacyResult.fail(this._error!);
  }

  /**
   * Maps the error to a new type
   * @param fn Function to transform the error
   * @returns A new LegacyResult with the transformed error
   */
  mapError<F>(fn: (error: E) => F): LegacyResult<T, F> {
    if (this._isSuccess) {
      return LegacyResult.ok(this._value!);
    }
    return LegacyResult.fail(fn(this._error!));
  }

  /**
   * Chains two operations that return Results
   * @param fn Function that takes the value and returns a new LegacyResult
   * @returns The Result from the function if this is successful, otherwise this error
   */
  flatMap<U>(fn: (value: T) => LegacyResult<U, E>): LegacyResult<U, E> {
    if (this._isSuccess) {
      return fn(this._value!);
    }
    return LegacyResult.fail(this._error!);
  }

  /**
   * Gets the value if successful, or a default value if failed
   * @param defaultValue The default value to return on failure
   * @returns The value or default value
   */
  getOrElse(defaultValue: T): T {
    return this._isSuccess ? this._value! : defaultValue;
  }

  /**
   * Gets the value if successful, or computes a default value if failed
   * @param fn Function to compute the default value
   * @returns The value or computed default value
   */
  getOrElseGet(fn: (error: E) => T): T {
    return this._isSuccess ? this._value! : fn(this._error!);
  }

  /**
   * Executes a side effect if successful
   * @param fn Function to execute with the value
   * @returns This Result for chaining
   */
  onOk(fn: (value: T) => void): LegacyResult<T, E> {
    if (this._isSuccess) {
      fn(this._value!);
    }
    return this;
  }

  /**
   * Executes a side effect if failed
   * @param fn Function to execute with the error
   * @returns This Result for chaining
   */
  onFailure(fn: (error: E) => void): LegacyResult<T, E> {
    if (!this._isSuccess) {
      fn(this._error!);
    }
    return this;
  }
}

/**
 * Combines multiple Results into a single Result
 * If all are successful, returns ok with array of values
 * If any fails, returns the first failure
 * @param results Array of Results to combine
 * @returns Combined Result
 */
export function combine<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = [];

  for (const result of results) {
    if (Result.isOk(result)) {
      values.push(result.value);
    }

    if (Result.isFailure(result)) {
      return Result.fail(result.erro);
    }
  }

  return Result.ok(values);
}

/**
 * Wraps a function that might throw in a Result
 * @param fn Function that might throw
 * @returns Result containing the return value or error
 */
export function tryCatch<T>(fn: () => T): Result<T, Error> {
  try {
    return Result.ok(fn());
  } catch (error) {
    return Result.fail(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Wraps an async function that might throw in a Result
 * @param fn Async function that might throw
 * @returns Promise of Result containing the return value or error
 */
export async function tryCatchAsync<T>(fn: () => Promise<T>): Promise<Result<T, Error>> {
  try {
    const value = await fn();
    return Result.ok(value);
  } catch (error) {
    return Result.fail(error instanceof Error ? error : new Error(String(error)));
  }
}
