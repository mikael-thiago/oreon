import { expect } from "vitest";
import { Result } from "../../domain/shared/result.js";

/**
 * Custom Vitest matchers for Result pattern
 * Provides fluent assertions for Ok and Failure results
 */

expect.extend({
  /**
   * Asserts that a Result is successful (Ok)
   * @param received - The Result to check
   * @returns Assertion result
   */
  toBeOk(received: unknown) {
    if (!Result.isResult(received)) {
      return { pass: false, message: () => "Provided value is not a result instance" };
    }

    const pass = Result.isOk(received);

    return {
      pass,
      message: () =>
        pass
          ? `Expected Result not to be Ok`
          : `Expected Result to be Ok, but got Failure with error: ${JSON.stringify(received.erro)}`,
    };
  },

  /**
   * Asserts that a Result is a failure
   * @param received - The Result to check
   * @returns Assertion result
   */
  toBeFailure(received: any) {
    const pass = Result.isFailure(received);
    return {
      pass,
      message: () =>
        pass
          ? `Expected Result not to be Failure`
          : `Expected Result to be Failure, but got Ok with value: ${JSON.stringify(received.value)}`,
    };
  },

  /**
   * Asserts that a Result is a failure AND the error is an instance of the specified class
   * @param received - The Result to check
   * @param errorClass - The expected error class constructor
   * @returns Assertion result
   */
  toBeFailureWith(received: any, errorClass: new (...args: any[]) => any) {
    if (!Result.isFailure(received)) {
      return {
        pass: false,
        message: () =>
          `Expected Result to be Failure with ${errorClass.name}, but got Ok with value: ${JSON.stringify(
            received.value
          )}`,
      };
    }

    const pass = received.erro instanceof errorClass;
    return {
      pass,
      message: () =>
        pass
          ? `Expected Result not to be Failure with ${errorClass.name}`
          : `Expected Result to be Failure with ${errorClass.name}, but got ${received.erro.constructor.name}`,
    };
  },
});

// TypeScript declarations for custom matchers
declare module "vitest" {
  interface Assertion<T = any> {
    /**
     * Asserts that a Result is successful (Ok)
     */
    toBeOk(): T;

    /**
     * Asserts that a Result is a failure
     */
    toBeFailure(): T;

    /**
     * Asserts that a Result is a failure AND the error is an instance of the specified class
     * @param errorClass - The expected error class constructor
     */
    toBeFailureWith(errorClass: new (...args: any[]) => any): T;
  }

  interface AsymmetricMatchersContaining {
    /**
     * Asserts that a Result is successful (Ok)
     */
    toBeOk(): any;

    /**
     * Asserts that a Result is a failure
     */
    toBeFailure(): any;

    /**
     * Asserts that a Result is a failure AND the error is an instance of the specified class
     * @param errorClass - The expected error class constructor
     */
    toBeFailureWith(errorClass: new (...args: any[]) => any): any;
  }
}
