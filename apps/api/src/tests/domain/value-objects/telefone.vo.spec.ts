import { describe, it, expect } from "vitest";
import { Telefone } from "../../../domain/value-objects/telefone.vo.js";
import { VALID_PHONES, INVALID_PHONES } from "../../helpers/test-data.js";
import { expectToBeOk, expectToBeFailure } from "../../helpers/assertions.js";

describe("Telefone Value Object", () => {
	describe("Creation", () => {
		it("should create valid mobile phone (11 digits)", () => {
			const result = Telefone.criar(VALID_PHONES.MOBILE_SP);

			expectToBeOk(result);
		});

		it("should create valid landline phone (10 digits)", () => {
			const result = Telefone.criar(VALID_PHONES.LANDLINE_SP);

			expectToBeOk(result);
		});

		it("should create phone from multiple valid formats", () => {
			const result1 = Telefone.criar(VALID_PHONES.MOBILE_SP);
			const result2 = Telefone.criar(VALID_PHONES.MOBILE_RJ);
			const result3 = Telefone.criar(VALID_PHONES.MOBILE_MG);
			const result4 = Telefone.criar(VALID_PHONES.LANDLINE_SP);
			const result5 = Telefone.criar(VALID_PHONES.LANDLINE_RJ);
			const result6 = Telefone.criar(VALID_PHONES.LANDLINE_MG);

			expectToBeOk(result1);
			expectToBeOk(result2);
			expectToBeOk(result3);
			expectToBeOk(result4);
			expectToBeOk(result5);
			expectToBeOk(result6);
		});

		it("should create phone without formatting", () => {
			const result1 = Telefone.criar(VALID_PHONES.MOBILE_UNFORMATTED);
			const result2 = Telefone.criar(VALID_PHONES.LANDLINE_UNFORMATTED);

			expectToBeOk(result1);
			expectToBeOk(result2);
		});

		it("should reject empty phone", () => {
			const result = Telefone.criar(INVALID_PHONES.EMPTY);

			expectToBeFailure(result);
		});

		it("should reject phone too short", () => {
			const result = Telefone.criar(INVALID_PHONES.TOO_SHORT);

			expectToBeFailure(result);
		});

		it("should reject phone too long", () => {
			const result = Telefone.criar(INVALID_PHONES.TOO_LONG);

			expectToBeFailure(result);
		});

		it("should reject phone with letters", () => {
			const result = Telefone.criar(INVALID_PHONES.WITH_LETTERS);

			expectToBeFailure(result);
		});

		it("should reject phone with 9 digits", () => {
			const result = Telefone.criar("123456789");

			expectToBeFailure(result);
		});

		it("should reject phone with 12 digits", () => {
			const result = Telefone.criar("123456789012");

			expectToBeFailure(result);
		});
	});

	describe("Formatting", () => {
		it("should format mobile phone correctly", () => {
			const result = Telefone.criar(VALID_PHONES.MOBILE_SP);
			expectToBeOk(result);

			const formatted = result.value.formatar();

			expect(formatted).toMatch(/^\(\d{2}\) \d{5}-\d{4}$/);
			expect(formatted).toBe("(11) 98765-4321");
		});

		it("should format landline phone correctly", () => {
			const result = Telefone.criar(VALID_PHONES.LANDLINE_SP);
			expectToBeOk(result);

			const formatted = result.value.formatar();

			expect(formatted).toMatch(/^\(\d{2}\) \d{4}-\d{4}$/);
			expect(formatted).toBe("(11) 3456-7890");
		});

		it("should format mobile from unformatted input", () => {
			const result = Telefone.criar("11987654321");
			expectToBeOk(result);

			const formatted = result.value.formatar();

			expect(formatted).toBe("(11) 98765-4321");
		});

		it("should format landline from unformatted input", () => {
			const result = Telefone.criar("1134567890");
			expectToBeOk(result);

			const formatted = result.value.formatar();

			expect(formatted).toBe("(11) 3456-7890");
		});

		it("should return unformatted phone with toString", () => {
			const result = Telefone.criar(VALID_PHONES.MOBILE_SP);
			expectToBeOk(result);

			const unformatted = result.value.toString();

			expect(unformatted).toBe("11987654321");
			expect(unformatted).toMatch(/^\d{11}$/);
		});

		it("should return unformatted phone with getValor", () => {
			const result = Telefone.criar(VALID_PHONES.MOBILE_SP);
			expectToBeOk(result);

			const valor = result.value.getValor();

			expect(valor).toBe("11987654321");
			expect(valor).toMatch(/^\d{11}$/);
		});
	});

	describe("DDD Extraction", () => {
		it("should extract DDD from mobile phone", () => {
			const result = Telefone.criar(VALID_PHONES.MOBILE_SP);
			expectToBeOk(result);

			const ddd = result.value.getDDD();

			expect(ddd).toBe("11");
		});

		it("should extract DDD from landline phone", () => {
			const result = Telefone.criar(VALID_PHONES.LANDLINE_SP);
			expectToBeOk(result);

			const ddd = result.value.getDDD();

			expect(ddd).toBe("11");
		});

		it("should extract different DDDs correctly", () => {
			const resultSP = Telefone.criar(VALID_PHONES.MOBILE_SP);
			const resultRJ = Telefone.criar(VALID_PHONES.MOBILE_RJ);
			const resultMG = Telefone.criar(VALID_PHONES.MOBILE_MG);

			expectToBeOk(resultSP);
			expectToBeOk(resultRJ);
			expectToBeOk(resultMG);

			expect(resultSP.value.getDDD()).toBe("11");
			expect(resultRJ.value.getDDD()).toBe("21");
			expect(resultMG.value.getDDD()).toBe("31");
		});
	});

	describe("Number Extraction", () => {
		it("should extract number without DDD from mobile", () => {
			const result = Telefone.criar(VALID_PHONES.MOBILE_SP);
			expectToBeOk(result);

			const numero = result.value.getNumero();

			expect(numero).toBe("987654321");
			expect(numero).toHaveLength(9);
		});

		it("should extract number without DDD from landline", () => {
			const result = Telefone.criar(VALID_PHONES.LANDLINE_SP);
			expectToBeOk(result);

			const numero = result.value.getNumero();

			expect(numero).toBe("34567890");
			expect(numero).toHaveLength(8);
		});
	});

	describe("Phone Type Detection", () => {
		it("should identify mobile phone correctly", () => {
			const result = Telefone.criar(VALID_PHONES.MOBILE_SP);
			expectToBeOk(result);

			expect(result.value.isCelular()).toBe(true);
		});

		it("should identify landline phone correctly", () => {
			const result = Telefone.criar(VALID_PHONES.LANDLINE_SP);
			expectToBeOk(result);

			expect(result.value.isCelular()).toBe(false);
		});

		it("should identify all mobile phones from test data", () => {
			const resultSP = Telefone.criar(VALID_PHONES.MOBILE_SP);
			const resultRJ = Telefone.criar(VALID_PHONES.MOBILE_RJ);
			const resultMG = Telefone.criar(VALID_PHONES.MOBILE_MG);

			expectToBeOk(resultSP);
			expectToBeOk(resultRJ);
			expectToBeOk(resultMG);

			expect(resultSP.value.isCelular()).toBe(true);
			expect(resultRJ.value.isCelular()).toBe(true);
			expect(resultMG.value.isCelular()).toBe(true);
		});

		it("should identify all landline phones from test data", () => {
			const resultSP = Telefone.criar(VALID_PHONES.LANDLINE_SP);
			const resultRJ = Telefone.criar(VALID_PHONES.LANDLINE_RJ);
			const resultMG = Telefone.criar(VALID_PHONES.LANDLINE_MG);

			expectToBeOk(resultSP);
			expectToBeOk(resultRJ);
			expectToBeOk(resultMG);

			expect(resultSP.value.isCelular()).toBe(false);
			expect(resultRJ.value.isCelular()).toBe(false);
			expect(resultMG.value.isCelular()).toBe(false);
		});
	});

	describe("Comparison", () => {
		it("should compare phones correctly when equal", () => {
			const result1 = Telefone.criar(VALID_PHONES.MOBILE_SP);
			const result2 = Telefone.criar(VALID_PHONES.MOBILE_SP);

			expectToBeOk(result1);
			expectToBeOk(result2);

			expect(result1.value.equals(result2.value)).toBe(true);
		});

		it("should compare phones correctly when different", () => {
			const result1 = Telefone.criar(VALID_PHONES.MOBILE_SP);
			const result2 = Telefone.criar(VALID_PHONES.MOBILE_RJ);

			expectToBeOk(result1);
			expectToBeOk(result2);

			expect(result1.value.equals(result2.value)).toBe(false);
		});

		it("should compare phones regardless of formatting", () => {
			const result1 = Telefone.criar("(11) 98765-4321");
			const result2 = Telefone.criar("11987654321");

			expectToBeOk(result1);
			expectToBeOk(result2);

			expect(result1.value.equals(result2.value)).toBe(true);
		});

		it("should compare mobile and landline as different", () => {
			const resultMobile = Telefone.criar(VALID_PHONES.MOBILE_SP);
			const resultLandline = Telefone.criar(VALID_PHONES.LANDLINE_SP);

			expectToBeOk(resultMobile);
			expectToBeOk(resultLandline);

			expect(resultMobile.value.equals(resultLandline.value)).toBe(false);
		});
	});

	describe("Reconstitution", () => {
		it("should reconstitute mobile phone from database without validation", () => {
			const telefone = Telefone.reconstituir("11987654321");

			expect(telefone).toBeInstanceOf(Telefone);
			expect(telefone.getValor()).toBe("11987654321");
			expect(telefone.isCelular()).toBe(true);
		});

		it("should reconstitute landline phone from database without validation", () => {
			const telefone = Telefone.reconstituir("1134567890");

			expect(telefone).toBeInstanceOf(Telefone);
			expect(telefone.getValor()).toBe("1134567890");
			expect(telefone.isCelular()).toBe(false);
		});

		it("should reconstitute and format correctly", () => {
			const mobile = Telefone.reconstituir("11987654321");
			const landline = Telefone.reconstituir("1134567890");

			expect(mobile.formatar()).toBe("(11) 98765-4321");
			expect(landline.formatar()).toBe("(11) 3456-7890");
		});

		it("should reconstitute phone with formatting characters", () => {
			const telefone = Telefone.reconstituir("(11) 98765-4321");

			expect(telefone.getValor()).toBe("11987654321");
			expect(telefone.formatar()).toBe("(11) 98765-4321");
		});
	});

	describe("Input Cleaning", () => {
		it("should remove all non-numeric characters", () => {
			const result = Telefone.criar("(11) 98765-4321");

			expectToBeOk(result);
			expect(result.value.getValor()).toBe("11987654321");
		});

		it("should handle phone with dots", () => {
			const result = Telefone.criar("11.98765.4321");

			expectToBeOk(result);
			expect(result.value.getValor()).toBe("11987654321");
		});

		it("should handle phone with spaces", () => {
			const result = Telefone.criar("11 98765 4321");

			expectToBeOk(result);
			expect(result.value.getValor()).toBe("11987654321");
		});

		it("should handle phone with mixed formatting", () => {
			const result = Telefone.criar("(11) 9.8765-4321");

			expectToBeOk(result);
			expect(result.value.getValor()).toBe("11987654321");
		});
	});

	describe("Edge Cases", () => {
		it("should handle phone with extra characters at start", () => {
			const result = Telefone.criar("+55 11 98765-4321");

			expectToBeFailure(result); // Too many digits after cleaning
		});

		it("should validate all valid test phones", () => {
			Object.values(VALID_PHONES).forEach((phone) => {
				const result = Telefone.criar(phone);
				expectToBeOk(result);
			});
		});

		it("should reject all invalid test phones", () => {
			Object.values(INVALID_PHONES).forEach((phone) => {
				const result = Telefone.criar(phone);
				expectToBeFailure(result);
			});
		});

		it("should handle different area codes", () => {
			const phones = [
				"11987654321", // SP
				"21987654321", // RJ
				"31987654321", // MG
				"41987654321", // PR
				"51987654321", // RS
				"61987654321", // DF
				"71987654321", // BA
				"81987654321", // PE
				"85987654321", // CE
			];

			phones.forEach((phone) => {
				const result = Telefone.criar(phone);
				expectToBeOk(result);
			});
		});
	});
});
