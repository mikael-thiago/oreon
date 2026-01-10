import { describe, expect, it } from "vitest";
import { Colaborador } from "../../../domain/entities/colaborador.entity.js";
import {
  expectToBeFailure,
  expectToBeOk,
  INVALID_CPFS,
  INVALID_EMAILS,
  INVALID_NAMES,
  VALID_CPFS,
  VALID_EMAILS,
  VALID_NAMES,
} from "../../helpers/index.js";

describe("Colaborador Entity", () => {
  describe("Criação", () => {
    it("deve criar um colaborador válido", () => {
      const result = Colaborador.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        email: VALID_EMAILS.EMAIL_1,
        escolaId: 1,
        usuario: {
          id: 1,
          email: VALID_EMAILS.EMAIL_1,
        },
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.id).toBe(1);
      expect(result.value.nomeCompleto).toBe(VALID_NAMES.FULL_NAME);
      expect(result.value.cpfFormatado).toBe(VALID_CPFS.CPF_1);
      expect(result.value.emailValor).toBe(VALID_EMAILS.EMAIL_1);
      expect(result.value.escolaId).toBe(1);
      expect(result.value.usuario.id).toBe(1);
    });

    it("deve rejeitar CPF inválido", () => {
      const result = Colaborador.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: INVALID_CPFS.INVALID_CHECKSUM,
        email: VALID_EMAILS.EMAIL_1,
        escolaId: 1,
        usuario: {
          id: 1,
          email: VALID_EMAILS.EMAIL_1,
        },
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
      const result = Colaborador.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        email: INVALID_EMAILS.NO_AT,
        escolaId: 1,
        usuario: {
          id: 1,
          email: INVALID_EMAILS.NO_AT,
        },
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

    it("deve rejeitar nome inválido", () => {
      const result = Colaborador.criar({
        id: 1,
        nome: INVALID_NAMES.TOO_SHORT,
        cpf: VALID_CPFS.CPF_1,
        email: VALID_EMAILS.EMAIL_1,
        escolaId: 1,
        usuario: {
          id: 1,
          email: VALID_EMAILS.EMAIL_1,
        },
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

    it("deve normalizar emails para minúsculas", () => {
      const emailUpperCase = "TEST@EXAMPLE.COM";
      const emailLowerCase = "test@example.com";

      const result = Colaborador.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        email: emailUpperCase,
        escolaId: 1,
        usuario: {
          id: 1,
          email: emailLowerCase, // Should match after normalization
        },
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.emailValor).toBe(emailLowerCase);
    });

    it("deve aceitar email com maiúsculas no usuário", () => {
      const emailMixed = "Test@Example.COM";

      const result = Colaborador.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        email: emailMixed,
        escolaId: 1,
        usuario: {
          id: 1,
          email: emailMixed,
        },
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.emailValor).toBe(emailMixed.toLowerCase());
    });

    it("deve aceitar diferentes formatos de nome", () => {
      // Name with accents
      const resultAccents = Colaborador.criar({
        id: 1,
        nome: VALID_NAMES.WITH_ACCENTS,
        cpf: VALID_CPFS.CPF_1,
        email: VALID_EMAILS.EMAIL_1,
        escolaId: 1,
        usuario: {
          id: 1,
          email: VALID_EMAILS.EMAIL_1,
        },
      });

      if (!expectToBeOk(resultAccents)) return;

      // Name with hyphen
      const resultHyphen = Colaborador.criar({
        id: 1,
        nome: VALID_NAMES.WITH_HYPHEN,
        cpf: VALID_CPFS.CPF_2,
        email: VALID_EMAILS.EMAIL_2,
        escolaId: 1,
        usuario: {
          id: 1,
          email: VALID_EMAILS.EMAIL_2,
        },
      });

      if (!expectToBeOk(resultHyphen)) return;
    });
  });

  describe("Reconstituição", () => {
    it("deve reconstituir colaborador a partir de dados do banco de dados", () => {
      const colaborador = Colaborador.reconstituir({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        email: VALID_EMAILS.EMAIL_1,
        escolaId: 1,
        usuario: {
          id: 1,
          email: VALID_EMAILS.EMAIL_1,
        },
      });

      expect(colaborador).toBeInstanceOf(Colaborador);
      expect(colaborador.id).toBe(1);
      expect(colaborador.nomeCompleto).toBe(VALID_NAMES.FULL_NAME);
      expect(colaborador.cpfFormatado).toBe(VALID_CPFS.CPF_1);
      expect(colaborador.emailValor).toBe(VALID_EMAILS.EMAIL_1);
      expect(colaborador.escolaId).toBe(1);
      expect(colaborador.usuario.id).toBe(1);
    });

    it("deve preservar todas as propriedades na reconstituição", () => {
      const colaborador = Colaborador.reconstituir({
        id: 999,
        nome: VALID_NAMES.WITH_APOSTROPHE,
        cpf: VALID_CPFS.CPF_3,
        email: VALID_EMAILS.EMAIL_3,
        escolaId: 5,
        usuario: {
          id: 777,
          email: VALID_EMAILS.EMAIL_3,
        },
      });

      expect(colaborador.id).toBe(999);
      expect(colaborador.nomeCompleto).toBe(VALID_NAMES.WITH_APOSTROPHE);
      expect(colaborador.cpfFormatado).toBe(VALID_CPFS.CPF_3);
      expect(colaborador.emailValor).toBe(VALID_EMAILS.EMAIL_3);
      expect(colaborador.escolaId).toBe(5);
      expect(colaborador.usuario.id).toBe(777);
    });
  });

  describe("Getters", () => {
    it("deve retornar CPF formatado corretamente", () => {
      const result = Colaborador.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        email: VALID_EMAILS.EMAIL_1,
        escolaId: 1,
        usuario: {
          id: 1,
          email: VALID_EMAILS.EMAIL_1,
        },
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.cpfFormatado).toBe(VALID_CPFS.CPF_1);
    });

    it("deve retornar value objects corretamente", () => {
      const result = Colaborador.criar({
        id: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        email: VALID_EMAILS.EMAIL_1,
        escolaId: 1,
        usuario: {
          id: 1,
          email: VALID_EMAILS.EMAIL_1,
        },
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.nome.getValor()).toBe(VALID_NAMES.FULL_NAME);
      expect(result.value.cpfFormatado).toBe(VALID_CPFS.CPF_1);
      expect(result.value.email.getValor()).toBe(VALID_EMAILS.EMAIL_1);
    });
  });
});
