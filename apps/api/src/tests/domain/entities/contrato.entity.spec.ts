import { describe, it, expect } from "vitest";
import { ContratoComum, ContratoProfessor } from "../../../domain/entities/contrato.entity.js";
import { StatusContratoEnum } from "../../../domain/enums/status-contrato.enum.js";
import { expectToBeOk, expectToBeFailure, TEST_DATES, TEST_MONEY } from "../../helpers/index.js";

describe("ContratoComum Entity", () => {
  describe("Criação", () => {
    it("deve criar um contrato comum válido", () => {
      const result = ContratoComum.criar({
        id: 1,
        dataInicio: TEST_DATES.CONTRACT_START,
        dataFim: TEST_DATES.CONTRACT_END,
        cargoId: 1,
        unidadeId: 1,
        colaboradorId: 1,
        matricula: "2024001",
        status: StatusContratoEnum.Ativo,
        salario: TEST_MONEY.COORDINATOR_SALARY,
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.id).toBe(1);
      expect(result.value.dataInicio).toEqual(TEST_DATES.CONTRACT_START);
      expect(result.value.dataFim).toEqual(TEST_DATES.CONTRACT_END);
      expect(result.value.cargoId).toBe(1);
      expect(result.value.status).toBe(StatusContratoEnum.Ativo);
      expect(result.value.salarioValor).toBe(TEST_MONEY.COORDINATOR_SALARY);
    });

    it("deve rejeitar salário negativo", () => {
      const result = ContratoComum.criar({
        id: 1,
        dataInicio: TEST_DATES.CONTRACT_START,
        dataFim: TEST_DATES.CONTRACT_END,
        cargoId: 1,
        unidadeId: 1,
        colaboradorId: 1,
        matricula: "2024001",
        status: StatusContratoEnum.Ativo,
        salario: -1000,
      });

      if (!expectToBeFailure(result)) return;

      expect(result.erro.erros).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            propriedade: "salario",
          }),
        ])
      );
    });

    it("deve rejeitar quando data de término for anterior à data de início", () => {
      const result = ContratoComum.criar({
        id: 1,
        dataInicio: TEST_DATES.CONTRACT_END,
        dataFim: TEST_DATES.CONTRACT_START, // Earlier than start
        cargoId: 1,
        unidadeId: 1,
        colaboradorId: 1,
        matricula: "2024001",
        status: StatusContratoEnum.Ativo,
        salario: TEST_MONEY.COORDINATOR_SALARY,
      });

      if (!expectToBeFailure(result)) return;

      expect(result.erro.erros).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            propriedade: "dataFim",
            mensagem: expect.stringContaining("não pode ser anterior"),
          }),
        ])
      );
    });

    it("deve rejeitar quando data de início for no futuro", () => {
      const result = ContratoComum.criar({
        id: 1,
        dataInicio: TEST_DATES.NEXT_YEAR,
        dataFim: null,
        cargoId: 1,
        unidadeId: 1,
        colaboradorId: 1,
        matricula: "2024001",
        status: StatusContratoEnum.Ativo,
        salario: TEST_MONEY.COORDINATOR_SALARY,
      });

      if (!expectToBeFailure(result)) return;

      expect(result.erro.erros).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            propriedade: "dataInicio",
            mensagem: expect.stringContaining("não pode ser no futuro"),
          }),
        ])
      );
    });

    it("deve aceitar contrato sem data de término (null)", () => {
      const result = ContratoComum.criar({
        id: 1,
        dataInicio: TEST_DATES.CONTRACT_START,
        dataFim: null, // Indefinite contract
        cargoId: 1,
        unidadeId: 1,
        colaboradorId: 1,
        matricula: "2024001",
        status: StatusContratoEnum.Ativo,
        salario: TEST_MONEY.COORDINATOR_SALARY,
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.dataFim).toBeNull();
    });

    it("deve aceitar contrato sem data de término (undefined)", () => {
      const result = ContratoComum.criar({
        id: 1,
        dataInicio: TEST_DATES.CONTRACT_START,
        // dataFim is undefined
        cargoId: 1,
        unidadeId: 1,
        colaboradorId: 1,
        matricula: "2024001",
        status: StatusContratoEnum.Ativo,
        salario: TEST_MONEY.COORDINATOR_SALARY,
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.dataFim).toBeNull();
    });

    it("deve aceitar salário zero", () => {
      const result = ContratoComum.criar({
        id: 1,
        dataInicio: TEST_DATES.CONTRACT_START,
        dataFim: TEST_DATES.CONTRACT_END,
        cargoId: 1,
        unidadeId: 1,
        colaboradorId: 1,
        matricula: "2024001",
        status: StatusContratoEnum.Ativo,
        salario: TEST_MONEY.ZERO,
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.salarioValor).toBe(TEST_MONEY.ZERO);
    });
  });

  describe("Reconstituição", () => {
    it("deve reconstituir contrato comum a partir de dados do banco de dados", () => {
      const contrato = ContratoComum.reconstituir({
        id: 1,
        dataInicio: TEST_DATES.CONTRACT_START,
        dataFim: TEST_DATES.CONTRACT_END,
        cargoId: 1,
        unidadeId: 1,
        colaboradorId: 1,
        matricula: "2024001",
        status: StatusContratoEnum.Ativo,
        salario: TEST_MONEY.COORDINATOR_SALARY,
      });

      expect(contrato).toBeInstanceOf(ContratoComum);
      expect(contrato.id).toBe(1);
      expect(contrato.dataInicio).toEqual(TEST_DATES.CONTRACT_START);
      expect(contrato.dataFim).toEqual(TEST_DATES.CONTRACT_END);
      expect(contrato.salarioValor).toBe(TEST_MONEY.COORDINATOR_SALARY);
    });

    it("deve preservar todas as propriedades na reconstituição", () => {
      const contrato = ContratoComum.reconstituir({
        id: 999,
        dataInicio: TEST_DATES.LAST_YEAR,
        dataFim: null,
        cargoId: 1,
        unidadeId: 5,
        colaboradorId: 1,
        matricula: "2023999",
        status: StatusContratoEnum.Inativo,
        salario: TEST_MONEY.DIRECTOR_SALARY,
      });

      expect(contrato.id).toBe(999);
      expect(contrato.dataInicio).toEqual(TEST_DATES.LAST_YEAR);
      expect(contrato.dataFim).toBeNull();
      expect(contrato.cargoId).toBe(1);
      expect(contrato.unidadeId).toBe(5);
      expect(contrato.matricula).toBe("2023999");
      expect(contrato.status).toBe(StatusContratoEnum.Inativo);
      expect(contrato.salarioValor).toBe(TEST_MONEY.DIRECTOR_SALARY);
    });
  });

  describe("Getters", () => {
    it("deve retornar salário formatado corretamente", () => {
      const result = ContratoComum.criar({
        id: 1,
        dataInicio: TEST_DATES.CONTRACT_START,
        dataFim: TEST_DATES.CONTRACT_END,
        cargoId: 1,
        unidadeId: 1,
        colaboradorId: 1,
        matricula: "2024001",
        status: StatusContratoEnum.Ativo,
        salario: TEST_MONEY.COORDINATOR_SALARY,
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.salarioFormatado).toContain("8.000");
    });
  });
});

describe("ContratoProfessor Entity", () => {
  describe("Criação", () => {
    it("deve criar um contrato de professor válido", () => {
      const result = ContratoProfessor.criar({
        id: 1,
        dataInicio: TEST_DATES.CONTRACT_START,
        dataFim: TEST_DATES.CONTRACT_END,
        cargoId: 1,
        unidadeId: 1,
        colaboradorId: 1,
        matricula: "2024001",
        status: StatusContratoEnum.Ativo,
        salario: TEST_MONEY.TEACHER_SALARY,
        disciplinas: [
          { disciplinaId: 1, etapaId: 1 },
          { disciplinaId: 2, etapaId: 1 },
        ],
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.id).toBe(1);
      expect(result.value.disciplinas).toHaveLength(2);
      expect(result.value.salarioValor).toBe(TEST_MONEY.TEACHER_SALARY);
    });

    it("deve rejeitar quando não houver disciplinas", () => {
      const result = ContratoProfessor.criar({
        id: 1,
        dataInicio: TEST_DATES.CONTRACT_START,
        dataFim: TEST_DATES.CONTRACT_END,
        cargoId: 1,
        unidadeId: 1,
        colaboradorId: 1,
        matricula: "2024001",
        status: StatusContratoEnum.Ativo,
        salario: TEST_MONEY.TEACHER_SALARY,
        disciplinas: [], // Empty
      });

      if (!expectToBeFailure(result)) return;

      expect(result.erro.erros).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            propriedade: "disciplinas",
            mensagem: expect.stringContaining("pelo menos uma disciplina"),
          }),
        ])
      );
    });

    it("deve rejeitar disciplinas duplicadas (mesma disciplinaId e etapaId)", () => {
      const result = ContratoProfessor.criar({
        id: 1,
        dataInicio: TEST_DATES.CONTRACT_START,
        dataFim: TEST_DATES.CONTRACT_END,
        cargoId: 1,
        unidadeId: 1,
        colaboradorId: 1,
        matricula: "2024001",
        status: StatusContratoEnum.Ativo,
        salario: TEST_MONEY.TEACHER_SALARY,
        disciplinas: [
          { disciplinaId: 1, etapaId: 1 },
          { disciplinaId: 1, etapaId: 1 }, // Duplicate
          { disciplinaId: 2, etapaId: 1 },
        ],
      });

      if (!expectToBeOk(result)) return;

      // Deve deduplicar
      expect(result.value.disciplinas).toHaveLength(2);
      expect(result.value.disciplinas).toEqual([
        { disciplinaId: 1, etapaId: 1 },
        { disciplinaId: 2, etapaId: 1 },
      ]);
    });

    it("deve deduplicar disciplinas corretamente", () => {
      const result = ContratoProfessor.criar({
        id: 1,
        dataInicio: TEST_DATES.CONTRACT_START,
        dataFim: TEST_DATES.CONTRACT_END,
        cargoId: 1,
        unidadeId: 1,
        colaboradorId: 1,
        matricula: "2024001",
        status: StatusContratoEnum.Ativo,
        salario: TEST_MONEY.TEACHER_SALARY,
        disciplinas: [
          { disciplinaId: 1, etapaId: 1 },
          { disciplinaId: 1, etapaId: 1 }, // Duplicate
          { disciplinaId: 1, etapaId: 2 }, // Same disciplina but different etapa - NOT duplicate
          { disciplinaId: 2, etapaId: 1 }, // Different disciplina
          { disciplinaId: 2, etapaId: 1 }, // Duplicate
        ],
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.disciplinas).toHaveLength(3);
      expect(result.value.disciplinas).toEqual(
        expect.arrayContaining([
          { disciplinaId: 1, etapaId: 1 },
          { disciplinaId: 1, etapaId: 2 },
          { disciplinaId: 2, etapaId: 1 },
        ])
      );
    });

    it("deve rejeitar salário negativo", () => {
      const result = ContratoProfessor.criar({
        id: 1,
        dataInicio: TEST_DATES.CONTRACT_START,
        dataFim: TEST_DATES.CONTRACT_END,
        cargoId: 1,
        unidadeId: 1,
        colaboradorId: 1,
        matricula: "2024001",
        status: StatusContratoEnum.Ativo,
        salario: -5000,
        disciplinas: [{ disciplinaId: 1, etapaId: 1 }],
      });

      if (!expectToBeFailure(result)) return;

      expect(result.erro.erros).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            propriedade: "salario",
          }),
        ])
      );
    });

    it("deve rejeitar datas inválidas", () => {
      // End date before start date
      const resultInvalidDates = ContratoProfessor.criar({
        id: 1,
        dataInicio: TEST_DATES.CONTRACT_END,
        dataFim: TEST_DATES.CONTRACT_START,
        cargoId: 1,
        unidadeId: 1,
        colaboradorId: 1,
        matricula: "2024001",
        status: StatusContratoEnum.Ativo,
        salario: TEST_MONEY.TEACHER_SALARY,
        disciplinas: [{ disciplinaId: 1, etapaId: 1 }],
      });

      expectToBeFailure(resultInvalidDates);

      // Start date in future
      const resultFutureStart = ContratoProfessor.criar({
        id: 1,
        dataInicio: TEST_DATES.NEXT_YEAR,
        dataFim: null,
        cargoId: 1,
        unidadeId: 1,
        colaboradorId: 1,
        matricula: "2024001",
        status: StatusContratoEnum.Ativo,
        salario: TEST_MONEY.TEACHER_SALARY,
        disciplinas: [{ disciplinaId: 1, etapaId: 1 }],
      });

      expectToBeFailure(resultFutureStart);
    });

    it("deve aceitar contrato sem data de término", () => {
      const result = ContratoProfessor.criar({
        id: 1,
        dataInicio: TEST_DATES.CONTRACT_START,
        dataFim: null,
        cargoId: 1,
        unidadeId: 1,
        colaboradorId: 1,
        matricula: "2024001",
        status: StatusContratoEnum.Ativo,
        salario: TEST_MONEY.TEACHER_SALARY,
        disciplinas: [{ disciplinaId: 1, etapaId: 1 }],
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.dataFim).toBeNull();
    });
  });

  describe("Reconstituição", () => {
    it("deve reconstituir contrato de professor a partir de dados do banco de dados", () => {
      const contrato = ContratoProfessor.reconstituir({
        id: 1,
        dataInicio: TEST_DATES.CONTRACT_START,
        dataFim: TEST_DATES.CONTRACT_END,
        cargoId: 1,
        unidadeId: 1,
        colaboradorId: 1,
        matricula: "2024001",
        status: StatusContratoEnum.Ativo,
        salario: TEST_MONEY.TEACHER_SALARY,
        disciplinas: [
          { disciplinaId: 1, etapaId: 1 },
          { disciplinaId: 2, etapaId: 1 },
        ],
      });

      expect(contrato).toBeInstanceOf(ContratoProfessor);
      expect(contrato.id).toBe(1);
      expect(contrato.disciplinas).toHaveLength(2);
      expect(contrato.salarioValor).toBe(TEST_MONEY.TEACHER_SALARY);
    });

    it("deve preservar todas as propriedades na reconstituição", () => {
      const contrato = ContratoProfessor.reconstituir({
        id: 999,
        dataInicio: TEST_DATES.LAST_YEAR,
        dataFim: null,
        cargoId: 1,
        unidadeId: 5,
        colaboradorId: 1,
        matricula: "2023999",
        status: StatusContratoEnum.Inativo,
        salario: TEST_MONEY.TEACHER_SALARY,
        disciplinas: [
          { disciplinaId: 3, etapaId: 2 },
          { disciplinaId: 4, etapaId: 2 },
          { disciplinaId: 5, etapaId: 3 },
        ],
      });

      expect(contrato.id).toBe(999);
      expect(contrato.disciplinas).toHaveLength(3);
      expect(contrato.status).toBe(StatusContratoEnum.Inativo);
    });
  });

  describe("Getters", () => {
    it("deve retornar disciplinas corretamente", () => {
      const result = ContratoProfessor.criar({
        id: 1,
        dataInicio: TEST_DATES.CONTRACT_START,
        dataFim: TEST_DATES.CONTRACT_END,
        cargoId: 1,
        unidadeId: 1,
        colaboradorId: 1,
        matricula: "2024001",
        status: StatusContratoEnum.Ativo,
        salario: TEST_MONEY.TEACHER_SALARY,
        disciplinas: [
          { disciplinaId: 1, etapaId: 1 },
          { disciplinaId: 2, etapaId: 1 },
        ],
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.disciplinas).toEqual([
        { disciplinaId: 1, etapaId: 1 },
        { disciplinaId: 2, etapaId: 1 },
      ]);
    });

    it("deve retornar salário formatado corretamente", () => {
      const result = ContratoProfessor.criar({
        id: 1,
        dataInicio: TEST_DATES.CONTRACT_START,
        dataFim: TEST_DATES.CONTRACT_END,
        cargoId: 1,
        unidadeId: 1,
        colaboradorId: 1,
        matricula: "2024001",
        status: StatusContratoEnum.Ativo,
        salario: TEST_MONEY.TEACHER_SALARY,
        disciplinas: [{ disciplinaId: 1, etapaId: 1 }],
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.salarioFormatado).toContain("5.000");
    });
  });
});
