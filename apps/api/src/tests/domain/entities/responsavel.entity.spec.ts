import { describe, expect, it } from "vitest";
import { Responsavel } from "../../../domain/entities/responsavel.entity.js";
import {
  expectToBeFailure,
  expectToBeOk,
  INVALID_CPFS,
  INVALID_EMAILS,
  INVALID_NAMES,
  INVALID_PHONES,
  TEST_DATES,
  VALID_CPFS,
  VALID_EMAILS,
  VALID_NAMES,
  VALID_PHONES,
} from "../../helpers/index.js";

describe("Responsavel Entity", () => {
  describe("Criação", () => {
    it("deve criar um responsável válido", () => {
      const result = Responsavel.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        telefone: VALID_PHONES.MOBILE_SP,
        email: VALID_EMAILS.EMAIL_1,
        dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        escolaId: 1,
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.id).toBe(1);
      expect(result.value.nomeCompleto).toBe(VALID_NAMES.FULL_NAME);
      expect(result.value.cpfFormatado).toBe(VALID_CPFS.CPF_1);
      expect(result.value.emailValor).toBe(VALID_EMAILS.EMAIL_1);
      expect(result.value.escolaId).toBe(1);
    });

    it("deve rejeitar idade menor que 18 anos", () => {
      const dataDeNascimento = new Date();
      dataDeNascimento.setFullYear(dataDeNascimento.getFullYear() - 17); // 17 years old

      const result = Responsavel.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        telefone: VALID_PHONES.MOBILE_SP,
        email: VALID_EMAILS.EMAIL_1,
        dataDeNascimento,
        escolaId: 1,
      });

      if (!expectToBeFailure(result)) return;

      expect(result.erro.erros).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            propriedade: "dataDeNascimento",
            mensagem: expect.stringContaining("pelo menos 18 anos"),
          }),
        ])
      );
    });

    it("deve rejeitar idade maior que 120 anos", () => {
      const dataDeNascimento = new Date();
      dataDeNascimento.setFullYear(dataDeNascimento.getFullYear() - 121); // 121 years old

      const result = Responsavel.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        telefone: VALID_PHONES.MOBILE_SP,
        email: VALID_EMAILS.EMAIL_1,
        dataDeNascimento,
        escolaId: 1,
      });

      if (!expectToBeFailure(result)) return;

      expect(result.erro.erros).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            propriedade: "dataDeNascimento",
            mensagem: expect.stringContaining("não pode exceder 120 anos"),
          }),
        ])
      );
    });

    it("deve rejeitar data de nascimento no futuro", () => {
      const result = Responsavel.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        telefone: VALID_PHONES.MOBILE_SP,
        email: VALID_EMAILS.EMAIL_1,
        dataDeNascimento: TEST_DATES.TOMORROW,
        escolaId: 1,
      });

      if (!expectToBeFailure(result)) return;

      expect(result.erro.erros).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            propriedade: "dataDeNascimento",
            mensagem: expect.stringContaining("não pode ser no futuro"),
          }),
        ])
      );
    });

    it("deve rejeitar CPF inválido", () => {
      const result = Responsavel.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: INVALID_CPFS.ALL_SAME_DIGITS,
        telefone: VALID_PHONES.MOBILE_SP,
        email: VALID_EMAILS.EMAIL_1,
        dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        escolaId: 1,
      });

      if (!expectToBeFailure(result)) return;

      expect(result.erro.erros).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            propriedade: "cpf",
          }),
        ])
      );
    });

    it("deve rejeitar email inválido", () => {
      const result = Responsavel.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        telefone: VALID_PHONES.MOBILE_SP,
        email: INVALID_EMAILS.NO_AT,
        dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        escolaId: 1,
      });

      if (!expectToBeFailure(result)) return;

      expect(result.erro.erros).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            propriedade: "email",
          }),
        ])
      );
    });

    it("deve rejeitar telefone inválido", () => {
      const result = Responsavel.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        telefone: INVALID_PHONES.TOO_SHORT,
        email: VALID_EMAILS.EMAIL_1,
        dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        escolaId: 1,
      });

      if (!expectToBeFailure(result)) return;

      expect(result.erro.erros).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            propriedade: "telefone",
          }),
        ])
      );
    });

    it("deve rejeitar nome inválido", () => {
      const result = Responsavel.criar({
        id: 1,
        nome: INVALID_NAMES.WITH_NUMBERS,
        cpf: VALID_CPFS.CPF_1,
        telefone: VALID_PHONES.MOBILE_SP,
        email: VALID_EMAILS.EMAIL_1,
        dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        escolaId: 1,
      });

      if (!expectToBeFailure(result)) return;

      expect(result.erro.erros).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            propriedade: "nome",
          }),
        ])
      );
    });

    it("deve aceitar idade válida entre 18 e 120 anos", () => {
      // Test age 18
      const dataDeNascimento18Anos = new Date();
      dataDeNascimento18Anos.setFullYear(dataDeNascimento18Anos.getFullYear() - 18);

      const result18Anos = Responsavel.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        telefone: VALID_PHONES.MOBILE_SP,
        email: VALID_EMAILS.EMAIL_1,
        dataDeNascimento: dataDeNascimento18Anos,
        escolaId: 1,
      });

      if (!expectToBeOk(result18Anos)) return;

      // Test age 120
      const dataDeNascimento120Anos = new Date();
      dataDeNascimento120Anos.setFullYear(dataDeNascimento120Anos.getFullYear() - 120);

      const result120Anos = Responsavel.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_2,
        telefone: VALID_PHONES.MOBILE_RJ,
        email: VALID_EMAILS.EMAIL_2,
        dataDeNascimento: dataDeNascimento120Anos,
        escolaId: 1,
      });

      if (!expectToBeOk(result120Anos)) return;
    });

    it("deve aceitar telefones válidos com diferentes formatos", () => {
      // Mobile phone
      const resultMobile = Responsavel.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        telefone: VALID_PHONES.MOBILE_SP,
        email: VALID_EMAILS.EMAIL_1,
        dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        escolaId: 1,
      });

      if (!expectToBeOk(resultMobile)) return;

      // Landline phone
      const resultLandline = Responsavel.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_2,
        telefone: VALID_PHONES.LANDLINE_SP,
        email: VALID_EMAILS.EMAIL_2,
        dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        escolaId: 1,
      });

      if (!expectToBeOk(resultLandline)) return;
    });
  });

  describe("Reconstituição", () => {
    it("deve reconstituir responsável a partir de dados do banco de dados", () => {
      const responsavel = Responsavel.reconstituir({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        telefone: VALID_PHONES.MOBILE_SP,
        email: VALID_EMAILS.EMAIL_1,
        dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        escolaId: 1,
      });

      expect(responsavel).toBeInstanceOf(Responsavel);
      expect(responsavel.id).toBe(1);
      expect(responsavel.nomeCompleto).toBe(VALID_NAMES.FULL_NAME);
      expect(responsavel.cpfFormatado).toBe(VALID_CPFS.CPF_1);
      expect(responsavel.emailValor).toBe(VALID_EMAILS.EMAIL_1);
      expect(responsavel.escolaId).toBe(1);
    });

    it("deve preservar todas as propriedades na reconstituição", () => {
      const responsavel = Responsavel.reconstituir({
        id: 999,
        nome: VALID_NAMES.WITH_HYPHEN,
        cpf: VALID_CPFS.CPF_3,
        telefone: VALID_PHONES.MOBILE_MG,
        email: VALID_EMAILS.EMAIL_3,
        dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_50,
        escolaId: 5,
      });

      expect(responsavel.id).toBe(999);
      expect(responsavel.nomeCompleto).toBe(VALID_NAMES.WITH_HYPHEN);
      expect(responsavel.cpfFormatado).toBe(VALID_CPFS.CPF_3);
      expect(responsavel.dataDeNascimento).toEqual(TEST_DATES.RESPONSIBLE_AGE_50);
      expect(responsavel.escolaId).toBe(5);
    });
  });

  describe("Métodos de negócio", () => {
    it("deve calcular idade corretamente", () => {
      const dataDeNascimento = new Date();
      dataDeNascimento.setFullYear(dataDeNascimento.getFullYear() - 40);

      const result = Responsavel.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        telefone: VALID_PHONES.MOBILE_SP,
        email: VALID_EMAILS.EMAIL_1,
        dataDeNascimento,
        escolaId: 1,
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.idade).toBe(40);
    });

    it("deve verificar se é maior de idade", () => {
      const result = Responsavel.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        telefone: VALID_PHONES.MOBILE_SP,
        email: VALID_EMAILS.EMAIL_1,
        dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        escolaId: 1,
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.isMaiorDeIdade()).toBe(true);
    });
  });

  describe("Getters", () => {
    it("deve retornar valores formatados corretamente", () => {
      const result = Responsavel.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        telefone: VALID_PHONES.MOBILE_SP,
        email: VALID_EMAILS.EMAIL_1,
        dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        escolaId: 1,
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.cpfFormatado).toBe(VALID_CPFS.CPF_1);
      expect(result.value.telefoneFormatado).toBe(VALID_PHONES.MOBILE_SP);
    });

    it("deve retornar value objects corretamente", () => {
      const result = Responsavel.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        telefone: VALID_PHONES.MOBILE_SP,
        email: VALID_EMAILS.EMAIL_1,
        dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        escolaId: 1,
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.nome.getValor()).toBe(VALID_NAMES.FULL_NAME);
      expect(result.value.cpfFormatado).toBe(VALID_CPFS.CPF_1);
      expect(result.value.email.getValor()).toBe(VALID_EMAILS.EMAIL_1);
      expect(result.value.telefone.getValor()).toBeTruthy();
    });
  });
});
