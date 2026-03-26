import { describe, it, expect } from "vitest";
import { Dinheiro, Moeda } from "../../../domain/value-objects/dinheiro.vo.js";
import { TEST_MONEY } from "../../helpers/test-data.js";
import { expectToBeOk, expectToBeFailure } from "../../helpers/assertions.js";

describe("Dinheiro Value Object", () => {
  describe("Creation", () => {
    it("should create valid monetary amount", () => {
      const result = Dinheiro.criar(100.5);

      if (!expectToBeOk(result)) return;

      expect(result.value.getValor()).toBe(100.5);
    });

    it("should create zero amount", () => {
      const result = Dinheiro.criar(0);

      if (!expectToBeOk(result)) return;

      expect(result.value.getValor()).toBe(0);
      expect(result.value.isZero()).toBe(true);
    });

    it("should create Dinheiro with different currencies", () => {
      const resultBRL = Dinheiro.criar(100, Moeda.BRL);
      const resultUSD = Dinheiro.criar(100, Moeda.USD);
      const resultEUR = Dinheiro.criar(100, Moeda.EUR);

      if (!expectToBeOk(resultBRL) || !expectToBeOk(resultUSD) || !expectToBeOk(resultEUR)) return;

      expect(resultBRL.value.getMoeda()).toBe(Moeda.BRL);
      expect(resultUSD.value.getMoeda()).toBe(Moeda.USD);
      expect(resultEUR.value.getMoeda()).toBe(Moeda.EUR);
    });

    it("should reject negative amount", () => {
      const result = Dinheiro.criar(-100);

      expectToBeFailure(result);
    });

    it("should reject NaN", () => {
      const result = Dinheiro.criar(NaN);

      expectToBeFailure(result);
    });

    it("should reject Infinity", () => {
      const result = Dinheiro.criar(Infinity);

      expectToBeFailure(result);
    });

    it("should reject negative Infinity", () => {
      const result = Dinheiro.criar(-Infinity);

      expectToBeFailure(result);
    });

    it("should round to 2 decimal places on creation", () => {
      const result = Dinheiro.criar(100.999);

      if (!expectToBeOk(result)) return;

      expect(result.value.getValor()).toBe(101);
    });

    it("should round to 2 decimal places with banker's rounding", () => {
      const result1 = Dinheiro.criar(100.125);
      const result2 = Dinheiro.criar(100.135);

      if (!expectToBeOk(result1) || !expectToBeOk(result2)) return;

      expect(result1.value.getValor()).toBe(100.13);
      expect(result2.value.getValor()).toBe(100.14);
    });
  });

  describe("Operations - Addition", () => {
    it("should add two monetary amounts correctly", () => {
      const result1 = Dinheiro.criar(100);
      const result2 = Dinheiro.criar(50);

      if (!expectToBeOk(result1) || !expectToBeOk(result2)) return;

      const resultado = result1.value.somar(result2.value);

      expect(resultado.getValor()).toBe(150);
    });

    it("should add zero correctly", () => {
      const result = Dinheiro.criar(100);
      if (!expectToBeOk(result)) return;

      const zero = Dinheiro.zero();
      const resultado = result.value.somar(zero);

      expect(resultado.getValor()).toBe(100);
    });

    it("should handle decimal addition correctly", () => {
      const result1 = Dinheiro.criar(100.55);
      const result2 = Dinheiro.criar(50.45);

      if (!expectToBeOk(result1) || !expectToBeOk(result2)) return;

      const resultado = result1.value.somar(result2.value);

      expect(resultado.getValor()).toBe(151);
    });
  });

  describe("Operations - Subtraction", () => {
    it("should subtract two monetary amounts correctly", () => {
      const result1 = Dinheiro.criar(100);
      const result2 = Dinheiro.criar(50);

      if (!expectToBeOk(result1) || !expectToBeOk(result2)) return;

      const resultado = result1.value.subtrair(result2.value);

      if (!expectToBeOk(resultado)) return;

      expect(resultado.value.getValor()).toBe(50);
    });

    it("should subtract to zero", () => {
      const result1 = Dinheiro.criar(100);
      const result2 = Dinheiro.criar(100);

      if (!expectToBeOk(result1) || !expectToBeOk(result2)) return;

      const resultado = result1.value.subtrair(result2.value);

      if (!expectToBeOk(resultado)) return;

      expect(resultado.value.getValor()).toBe(0);
      expect(resultado.value.isZero()).toBe(true);
    });

    it("should reject subtraction that results in negative", () => {
      const result1 = Dinheiro.criar(50);
      const result2 = Dinheiro.criar(100);

      if (!expectToBeOk(result1) || !expectToBeOk(result2)) return;

      const resultado = result1.value.subtrair(result2.value);

      expectToBeFailure(resultado);
    });

    it("should handle decimal subtraction correctly", () => {
      const result1 = Dinheiro.criar(100.75);
      const result2 = Dinheiro.criar(50.25);

      if (!expectToBeOk(result1) || !expectToBeOk(result2)) return;

      const resultado = result1.value.subtrair(result2.value);

      if (!expectToBeOk(resultado)) return;

      expect(resultado.value.getValor()).toBe(50.5);
    });
  });

  describe("Operations - Multiplication", () => {
    it("should multiply correctly", () => {
      const result = Dinheiro.criar(100);
      if (!expectToBeOk(result)) return;

      const resultado = result.value.multiplicar(2);

      expect(resultado.getValor()).toBe(200);
    });

    it("should multiply by zero", () => {
      const result = Dinheiro.criar(100);
      if (!expectToBeOk(result)) return;

      const resultado = result.value.multiplicar(0);

      expect(resultado.getValor()).toBe(0);
      expect(resultado.isZero()).toBe(true);
    });

    it("should multiply by decimal factor", () => {
      const result = Dinheiro.criar(100);
      if (!expectToBeOk(result)) return;

      const resultado = result.value.multiplicar(1.5);

      expect(resultado.getValor()).toBe(150);
    });

    it("should round multiplication result to 2 decimals", () => {
      const result = Dinheiro.criar(100);
      if (!expectToBeOk(result)) return;

      const resultado = result.value.multiplicar(0.333);

      expect(resultado.getValor()).toBe(33.3);
    });
  });

  describe("Operations - Division", () => {
    it("should divide correctly", () => {
      const result = Dinheiro.criar(100);
      if (!expectToBeOk(result)) return;

      const resultado = result.value.dividir(2);

      if (!expectToBeOk(resultado)) return;

      expect(resultado.value.getValor()).toBe(50);
    });

    it("should reject division by zero", () => {
      const result = Dinheiro.criar(100);
      if (!expectToBeOk(result)) return;

      const resultado = result.value.dividir(0);

      expectToBeFailure(resultado);
    });

    it("should handle decimal division", () => {
      const result = Dinheiro.criar(100);
      if (!expectToBeOk(result)) return;

      const resultado = result.value.dividir(3);

      if (!expectToBeOk(resultado)) return;

      expect(resultado.value.getValor()).toBe(33.33);
    });

    it("should round division result to 2 decimals", () => {
      const result = Dinheiro.criar(100);
      if (!expectToBeOk(result)) return;

      const resultado = result.value.dividir(7);

      if (!expectToBeOk(resultado)) return;

      expect(resultado.value.getValor()).toBe(14.29);
    });
  });

  describe("Operations - Percentage", () => {
    it("should calculate percentage correctly", () => {
      const result = Dinheiro.criar(100);
      if (!expectToBeOk(result)) return;

      const resultado = result.value.porcentagem(10);

      expect(resultado.getValor()).toBe(10);
    });

    it("should calculate percentage with decimals", () => {
      const result = Dinheiro.criar(100);
      if (!expectToBeOk(result)) return;

      const resultado = result.value.porcentagem(15.5);

      expect(resultado.getValor()).toBe(15.5);
    });

    it("should calculate zero percentage", () => {
      const result = Dinheiro.criar(100);
      if (!expectToBeOk(result)) return;

      const resultado = result.value.porcentagem(0);

      expect(resultado.getValor()).toBe(0);
      expect(resultado.isZero()).toBe(true);
    });
  });

  describe("Currency Validation", () => {
    it("should prevent addition with different currencies", () => {
      const resultBRL = Dinheiro.criar(100, Moeda.BRL);
      const resultUSD = Dinheiro.criar(100, Moeda.USD);

      if (!expectToBeOk(resultBRL) || !expectToBeOk(resultUSD)) return;

      expect(() => resultBRL.value.somar(resultUSD.value)).toThrow();
    });

    it("should prevent subtraction with different currencies", () => {
      const resultBRL = Dinheiro.criar(100, Moeda.BRL);
      const resultUSD = Dinheiro.criar(100, Moeda.USD);

      if (!expectToBeOk(resultBRL) || !expectToBeOk(resultUSD)) return;

      expect(() => resultBRL.value.subtrair(resultUSD.value)).toThrow();
    });

    it("should prevent comparison with different currencies", () => {
      const resultBRL = Dinheiro.criar(100, Moeda.BRL);
      const resultUSD = Dinheiro.criar(100, Moeda.USD);

      if (!expectToBeOk(resultBRL) || !expectToBeOk(resultUSD)) return;

      expect(() => resultBRL.value.isMaiorQue(resultUSD.value)).toThrow();
      expect(() => resultBRL.value.isMenorQue(resultUSD.value)).toThrow();
    });
  });

  describe("Comparison", () => {
    it("should compare equal amounts correctly", () => {
      const result1 = Dinheiro.criar(100);
      const result2 = Dinheiro.criar(100);

      if (!expectToBeOk(result1) || !expectToBeOk(result2)) return;

      expect(result1.value.equals(result2.value)).toBe(true);
    });

    it("should compare different amounts correctly", () => {
      const result1 = Dinheiro.criar(100);
      const result2 = Dinheiro.criar(50);

      if (!expectToBeOk(result1) || !expectToBeOk(result2)) return;

      expect(result1.value.equals(result2.value)).toBe(false);
    });

    it("should compare greater than correctly", () => {
      const result1 = Dinheiro.criar(100);
      const result2 = Dinheiro.criar(50);

      if (!expectToBeOk(result1) || !expectToBeOk(result2)) return;

      expect(result1.value.isMaiorQue(result2.value)).toBe(true);
      expect(result2.value.isMaiorQue(result1.value)).toBe(false);
    });

    it("should compare less than correctly", () => {
      const result1 = Dinheiro.criar(50);
      const result2 = Dinheiro.criar(100);

      if (!expectToBeOk(result1) || !expectToBeOk(result2)) return;

      expect(result1.value.isMenorQue(result2.value)).toBe(true);
      expect(result2.value.isMenorQue(result1.value)).toBe(false);
    });

    it("should identify zero correctly", () => {
      const zero = Dinheiro.zero();
      const result = Dinheiro.criar(100);
      if (!expectToBeOk(result)) return;

      expect(zero.isZero()).toBe(true);
      expect(result.value.isZero()).toBe(false);
    });

    it("should not equal amounts with different currencies", () => {
      const resultBRL = Dinheiro.criar(100, Moeda.BRL);
      const resultUSD = Dinheiro.criar(100, Moeda.USD);

      if (!expectToBeOk(resultBRL) || !expectToBeOk(resultUSD)) return;

      expect(resultBRL.value.equals(resultUSD.value)).toBe(false);
    });
  });

  describe("Formatting", () => {
    it("should format BRL correctly", () => {
      const result = Dinheiro.criar(1234.56, Moeda.BRL);
      if (!expectToBeOk(result)) return;

      const formatted = result.value.formatar();

      expect(formatted).toContain("1.234,56");
    });

    it("should format USD correctly", () => {
      const result = Dinheiro.criar(1234.56, Moeda.USD);
      if (!expectToBeOk(result)) return;

      const formatted = result.value.formatar();

      expect(formatted).toContain("1,234.56");
    });

    it("should format EUR correctly", () => {
      const result = Dinheiro.criar(1234.56, Moeda.EUR);
      if (!expectToBeOk(result)) return;

      const formatted = result.value.formatar();

      expect(formatted).toContain("1.234,56");
    });

    it("should format zero correctly", () => {
      const zero = Dinheiro.zero();

      const formatted = zero.formatar();

      expect(formatted).toBeTruthy();
    });

    it("should toString return formatted value", () => {
      const result = Dinheiro.criar(100);
      if (!expectToBeOk(result)) return;

      const str = result.value.toString();

      expect(str).toBe(result.value.formatar());
    });
  });

  describe("Reconstitution", () => {
    it("should reconstitute Dinheiro from database without validation", () => {
      const dinheiro = Dinheiro.reconstituir(100.5);

      expect(dinheiro).toBeInstanceOf(Dinheiro);
      expect(dinheiro.getValor()).toBe(100.5);
    });

    it("should reconstitute with specific currency", () => {
      const dinheiro = Dinheiro.reconstituir(100, Moeda.USD);

      expect(dinheiro.getMoeda()).toBe(Moeda.USD);
      expect(dinheiro.getValor()).toBe(100);
    });

    it("should round on reconstitution", () => {
      const dinheiro = Dinheiro.reconstituir(100.999);

      expect(dinheiro.getValor()).toBe(101);
    });
  });

  describe("Factory Methods", () => {
    it("should create zero with factory method", () => {
      const zero = Dinheiro.zero();

      expect(zero.getValor()).toBe(0);
      expect(zero.isZero()).toBe(true);
      expect(zero.getMoeda()).toBe(Moeda.BRL);
    });

    it("should create zero with specific currency", () => {
      const zeroUSD = Dinheiro.zero(Moeda.USD);
      const zeroEUR = Dinheiro.zero(Moeda.EUR);

      expect(zeroUSD.getMoeda()).toBe(Moeda.USD);
      expect(zeroEUR.getMoeda()).toBe(Moeda.EUR);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very small amounts", () => {
      const result = Dinheiro.criar(0.01);

      if (!expectToBeOk(result)) return;

      expect(result.value.getValor()).toBe(0.01);
    });

    it("should handle large amounts", () => {
      const result = Dinheiro.criar(999999999.99);

      if (!expectToBeOk(result)) return;

      expect(result.value.getValor()).toBe(999999999.99);
    });

    it("should validate all test money values", () => {
      Object.values(TEST_MONEY).forEach((valor) => {
        const result = Dinheiro.criar(valor);
        if (!expectToBeOk(result)) return;
      });
    });
  });
});
