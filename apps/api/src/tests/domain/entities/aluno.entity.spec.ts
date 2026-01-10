import { describe, expect, it } from "vitest";
import { Aluno } from "../../../domain/entities/aluno.entity.js";
import { SexoEnum } from "../../../domain/enums/sexo.enum.js";
import {
  expectToBeFailure,
  expectToBeOk,
  INVALID_CPFS,
  INVALID_NAMES,
  TEST_DATES,
  VALID_CPFS,
  VALID_NAMES,
} from "../../helpers/index.js";

describe("Aluno Entity", () => {
  describe("Criação", () => {
    it("deve criar um aluno válido", () => {
      const result = Aluno.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        dataDeNascimento: TEST_DATES.STUDENT_AGE_10,
        sexo: SexoEnum.Feminino,
        escolaId: 1,
      });

      if (expectToBeOk(result)) {
        expect(result.value.id).toBe(1);
        expect(result.value.nomeCompleto).toBe(VALID_NAMES.FULL_NAME);
        expect(result.value.cpf.formatar()).toBe(VALID_CPFS.CPF_1);
        expect(result.value.sexo).toBe(SexoEnum.Feminino);
        expect(result.value.escolaId).toBe(1);
      }
    });

    it("deve rejeitar CPF inválido", () => {
      const result = Aluno.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: INVALID_CPFS.INVALID_CHECKSUM,
        dataDeNascimento: TEST_DATES.STUDENT_AGE_10,
        sexo: SexoEnum.Feminino,
        escolaId: 1,
      });

      if (expectToBeFailure(result)) {
        expect(result.erro.erros).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              propriedade: "cpf",
            }),
          ])
        );
      }
    });

    it("deve rejeitar nome inválido", () => {
      const result = Aluno.criar({
        id: 1,
        nome: INVALID_NAMES.TOO_SHORT,
        cpf: VALID_CPFS.CPF_1,
        dataDeNascimento: TEST_DATES.STUDENT_AGE_10,
        sexo: SexoEnum.Feminino,
        escolaId: 1,
      });

      if (expectToBeFailure(result)) {
        expect(result.erro.erros).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              propriedade: "nome",
            }),
          ])
        );
      }
    });

    it("deve rejeitar idade menor que 3 anos", () => {
      const dataDeNascimento = new Date();
      dataDeNascimento.setFullYear(dataDeNascimento.getFullYear() - 2); // 2 years old

      const result = Aluno.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        dataDeNascimento,
        sexo: SexoEnum.Feminino,
        escolaId: 1,
      });

      if (expectToBeFailure(result)) {
        expect(result.erro.erros).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              propriedade: "dataDeNascimento",
              mensagem: expect.stringContaining("entre 3 e 100 anos"),
            }),
          ])
        );
      }
    });

    it("deve rejeitar idade maior que 100 anos", () => {
      const dataDeNascimento = new Date();
      dataDeNascimento.setFullYear(dataDeNascimento.getFullYear() - 101); // 101 years old

      const result = Aluno.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        dataDeNascimento,
        sexo: SexoEnum.Feminino,
        escolaId: 1,
      });

      if (expectToBeFailure(result)) {
        expect(result.erro.erros).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              propriedade: "dataDeNascimento",
              mensagem: expect.stringContaining("entre 3 e 100 anos"),
            }),
          ])
        );
      }
    });

    it("deve rejeitar data de nascimento no futuro", () => {
      const result = Aluno.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        dataDeNascimento: TEST_DATES.TOMORROW,
        sexo: SexoEnum.Feminino,
        escolaId: 1,
      });

      expectToBeFailure(result);
    });

    it("deve aceitar idade válida entre 3 e 100 anos", () => {
      const dataDeNascimento3Anos = new Date();
      dataDeNascimento3Anos.setFullYear(dataDeNascimento3Anos.getFullYear() - 3);

      const result3Anos = Aluno.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        dataDeNascimento: dataDeNascimento3Anos,
        sexo: SexoEnum.Feminino,
        escolaId: 1,
      });

      expectToBeOk(result3Anos);

      const dataDeNascimento100Anos = new Date();
      dataDeNascimento100Anos.setFullYear(dataDeNascimento100Anos.getFullYear() - 100);

      const result100Anos = Aluno.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_2,
        dataDeNascimento: dataDeNascimento100Anos,
        sexo: SexoEnum.Masculino,
        escolaId: 1,
      });

      expectToBeOk(result100Anos);
    });

    it("deve aceitar sexo null", () => {
      const result = Aluno.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        dataDeNascimento: TEST_DATES.STUDENT_AGE_10,
        sexo: null,
        escolaId: 1,
      });

      if (expectToBeOk(result)) {
        expect(result.value.sexo).toBeNull();
      }
    });
  });

  describe("Reconstituição", () => {
    it("deve reconstituir aluno a partir de dados do banco de dados", () => {
      const aluno = Aluno.reconstituir({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        dataDeNascimento: TEST_DATES.STUDENT_AGE_10,
        sexo: SexoEnum.Feminino,
        escolaId: 1,
      });

      expect(aluno).toBeInstanceOf(Aluno);
      expect(aluno.id).toBe(1);
      expect(aluno.nomeCompleto).toBe(VALID_NAMES.FULL_NAME);
      expect(aluno.cpf.formatar()).toBe(VALID_CPFS.CPF_1);
      expect(aluno.sexo).toBe(SexoEnum.Feminino);
      expect(aluno.escolaId).toBe(1);
    });

    it("deve preservar todas as propriedades na reconstituição", () => {
      const aluno = Aluno.reconstituir({
        id: 999,
        nome: VALID_NAMES.WITH_ACCENTS,
        cpf: VALID_CPFS.CPF_3,
        dataDeNascimento: TEST_DATES.STUDENT_AGE_15,
        sexo: SexoEnum.Masculino,
        escolaId: 5,
      });

      expect(aluno.id).toBe(999);
      expect(aluno.nomeCompleto).toBe(VALID_NAMES.WITH_ACCENTS);
      expect(aluno.cpf.formatar()).toBe(VALID_CPFS.CPF_3);
      expect(aluno.dataDeNascimento).toEqual(TEST_DATES.STUDENT_AGE_15);
      expect(aluno.sexo).toBe(SexoEnum.Masculino);
      expect(aluno.escolaId).toBe(5);
    });
  });

  describe("Métodos de negócio", () => {
    it("deve calcular idade corretamente", () => {
      const dataDeNascimento = new Date();
      dataDeNascimento.setFullYear(dataDeNascimento.getFullYear() - 10);

      const result = Aluno.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        dataDeNascimento,
        sexo: SexoEnum.Feminino,
        escolaId: 1,
      });

      if (expectToBeOk(result)) {
        expect(result.value.idade).toBe(10);
      }
    });

    it("deve verificar se pode ser matriculado (idade válida)", () => {
      const result = Aluno.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        dataDeNascimento: TEST_DATES.STUDENT_AGE_10,
        sexo: SexoEnum.Feminino,
        escolaId: 1,
      });

      if (expectToBeOk(result)) {
        expect(result.value.podeSerMatriculado()).toBe(true);
      }
    });
  });

  describe("Getters", () => {
    it("deve retornar CPF formatado corretamente", () => {
      const result = Aluno.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        dataDeNascimento: TEST_DATES.STUDENT_AGE_10,
        sexo: SexoEnum.Feminino,
        escolaId: 1,
      });

      if (expectToBeOk(result)) {
        expect(result.value.cpfFormatado).toBe(VALID_CPFS.CPF_1);
      }
    });

    it("deve retornar value objects corretamente", () => {
      const result = Aluno.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        dataDeNascimento: TEST_DATES.STUDENT_AGE_10,
        sexo: SexoEnum.Feminino,
        escolaId: 1,
      });

      if (expectToBeOk(result)) {
        expect(result.value.nome.getValor()).toBe(VALID_NAMES.FULL_NAME);
        expect(result.value.cpf.formatar()).toBe(VALID_CPFS.CPF_1);
      }
    });
  });
});
