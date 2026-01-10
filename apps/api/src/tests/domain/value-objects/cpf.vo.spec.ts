import { describe, expect, it } from "vitest";
import { Result } from "../../../domain/shared/result.js";
import { CPF } from "../../../domain/value-objects/cpf.vo.js";
import { expectToBeOk, expectToBeFailure } from "../../helpers/assertions.js";
import { INVALID_CPFS, VALID_CPFS } from "../../helpers/test-data.js";

describe("CPF Value Object", () => {
  describe("Creation", () => {
    it("should create valid CPF", () => {
      const result = CPF.criar(VALID_CPFS.CPF_1);

      expectToBeOk(result);
    });

    it("should create CPF from multiple valid formats", () => {
      const result1 = CPF.criar(VALID_CPFS.CPF_1);
      const result2 = CPF.criar(VALID_CPFS.CPF_2);
      const result3 = CPF.criar(VALID_CPFS.CPF_3);
      const result4 = CPF.criar(VALID_CPFS.CPF_4);
      const result5 = CPF.criar(VALID_CPFS.CPF_5);

      expectToBeOk(result1);
      expectToBeOk(result2);
      expectToBeOk(result3);
      expectToBeOk(result4);
      expectToBeOk(result5);
    });

    it("should create CPF without formatting", () => {
      const result = CPF.criar("52998224725");

      expectToBeOk(result);
    });

    it("should reject invalid CPF with wrong checksum", () => {
      const result = CPF.criar(INVALID_CPFS.INVALID_CHECKSUM);

      expectToBeFailure(result);
    });

    it("should reject CPF with all same digits", () => {
      const result = CPF.criar(INVALID_CPFS.ALL_SAME_DIGITS);

      expectToBeFailure(result);
    });

    it("should reject empty CPF", () => {
      const result = CPF.criar(INVALID_CPFS.EMPTY);

      expectToBeFailure(result);
    });

    it("should reject CPF too short", () => {
      const result = CPF.criar(INVALID_CPFS.TOO_SHORT);

      expectToBeFailure(result);
    });

    it("should reject CPF with letters", () => {
      const result = CPF.criar(INVALID_CPFS.WITH_LETTERS);

      expectToBeFailure(result);
    });
  });

  describe("Formatting", () => {
    it("should format CPF correctly", () => {
      const cpf = CPF.criar(VALID_CPFS.CPF_1);

      if (expectToBeOk(cpf)) {
        const formatted = cpf.value.formatar();

        expect(formatted).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
        expect(formatted).toBe("529.982.247-25");
      }
    });

    it("should format CPF from unformatted input", () => {
      const cpf = CPF.criar("52998224725");

      if (expectToBeOk(cpf)) {
        const formatted = cpf.value.formatar();

        expect(formatted).toBe("529.982.247-25");
      }
    });

    it("should return unformatted CPF with toString", () => {
      const cpf = CPF.reconstituir(VALID_CPFS.CPF_1);

      const unformatted = cpf.toString();

      expect(unformatted).toBe("52998224725");
      expect(unformatted).toMatch(/^\d{11}$/);
    });

    it("should return unformatted CPF with getValor", () => {
      const cpf = CPF.criar(VALID_CPFS.CPF_1);

      if (expectToBeOk(cpf)) {
        const valor = cpf.value.getValor();

        expect(valor).toBe("52998224725");
        expect(valor).toMatch(/^\d{11}$/);
      }
    });
  });

  describe("Comparison", () => {
    it("should compare CPFs correctly when equal", () => {
      const cpf1 = CPF.criar(VALID_CPFS.CPF_1);
      const cpf2 = CPF.criar(VALID_CPFS.CPF_1);

      if (expectToBeOk(cpf1) && expectToBeOk(cpf2)) {
        expect(cpf1.value.equals(cpf2.value)).toBe(true);
      }
    });

    it("should compare CPFs correctly when different", () => {
      const cpf1 = CPF.criar(VALID_CPFS.CPF_1);
      const cpf2 = CPF.criar(VALID_CPFS.CPF_2);

      if (expectToBeOk(cpf1) && expectToBeOk(cpf2)) {
        expect(cpf1.value.equals(cpf2.value)).toBe(false);
      }
    });

    it("should compare CPFs regardless of formatting", () => {
      const cpf1 = CPF.criar("529.982.247-25");
      const cpf2 = CPF.criar("52998224725");

      if (expectToBeOk(cpf1) && expectToBeOk(cpf2)) {
        expect(cpf1.value.equals(cpf2.value)).toBe(true);
      }
    });
  });

  describe("Reconstitution", () => {
    it("should reconstitute CPF from database without validation", () => {
      const cpf = CPF.reconstituir("52998224725");

      expect(cpf).toBeInstanceOf(CPF);
      expect(cpf.getValor()).toBe("52998224725");
    });

    it("should reconstitute CPF and format correctly", () => {
      const cpf = CPF.reconstituir("52998224725");

      expect(cpf.formatar()).toBe("529.982.247-25");
    });

    it("should reconstitute CPF with formatting characters", () => {
      const cpf = CPF.reconstituir("529.982.247-25");

      expect(cpf.getValor()).toBe("52998224725");
      expect(cpf.formatar()).toBe("529.982.247-25");
    });
  });

  describe("Edge Cases", () => {
    it("should handle CPF with extra spaces", () => {
      const result = CPF.criar("  529.982.247-25  ");

      if (expectToBeOk(result)) {
		  expect(result.value.getValor()).toBe("52998224725");
	  }
    });

    it("should handle CPF with mixed formatting", () => {
      const result = CPF.criar("529 982 247-25");

      if (expectToBeOk(result)) {
		  expect(result.value.getValor()).toBe("52998224725");
	  }
    });

    it("should validate all test CPFs", () => {
      Object.values(VALID_CPFS).forEach((cpf) => {
        const result = CPF.criar(cpf);
        expectToBeOk(result);
      });
    });

    it("should reject all invalid test CPFs", () => {
      Object.values(INVALID_CPFS).forEach((cpf) => {
        const result = CPF.criar(cpf);
        expectToBeFailure(result);
      });
    });
  });
});
