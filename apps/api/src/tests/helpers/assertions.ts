import { expect } from "vitest";
import type { FailResult, OkResult, Result } from "../../domain/shared/result.js";

export function expectToBeOk<T, E>(result: Result<T, E>): result is OkResult<T> {
  expect(result).toBeOk();
  return true;
}

export function expectToBeFailure<T, E>(result: Result<T, E>): result is FailResult<E> {
  expect(result).toBeFailure();
  return true;
}
