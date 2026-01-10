import { describe, expect, it } from "vitest";
import { Matricula } from "../../../domain/entities/matricula.entity.js";
import { StatusMatriculaEnum } from "../../../domain/enums/status-matricula.enum.js";
import { expectToBeFailure, expectToBeOk, TEST_DATES } from "../../helpers/index.js";

describe("Matricula Entity", () => {
  describe("Criação", () => {
    it("deve criar uma matrícula válida", () => {
      const result = Matricula.criar({
        id: 1,
        unidadeId: 1,
        estudanteId: 1,
        periodoLetivoId: 1,
        comprovanteResidenciaId: 1,
        historicoEscolarId: 1,
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.id).toBe(1);
      expect(result.value.unidadeId).toBe(1);
      expect(result.value.estudanteId).toBe(1);
      expect(result.value.periodoLetivoId).toBe(1);
      expect(result.value.comprovanteResidenciaId).toBe(1);
      expect(result.value.historicoEscolarId).toBe(1);
    });

    it("deve rejeitar data de criação no futuro", () => {
      const result = Matricula.criar({
        id: 1,
        unidadeId: 1,
        estudanteId: 1,
        periodoLetivoId: 1,
        dataCriacao: TEST_DATES.TOMORROW,
        comprovanteResidenciaId: 1,
        historicoEscolarId: 1,
      });

      if (!expectToBeFailure(result)) return;

      expect(result.erro.erros).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            propriedade: "dataCriacao",
            mensagem: expect.stringContaining("não pode ser no futuro"),
          }),
        ])
      );
    });

    it("deve usar status Ativa por padrão", () => {
      const result = Matricula.criar({
        id: 1,
        unidadeId: 1,
        estudanteId: 1,
        periodoLetivoId: 1,
        comprovanteResidenciaId: 1,
        historicoEscolarId: 1,
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.status).toBe(StatusMatriculaEnum.Ativa);
      expect(result.value.isAtiva()).toBe(true);
    });

    it("deve usar data atual por padrão", () => {
      const antes = new Date();

      const result = Matricula.criar({
        id: 1,
        unidadeId: 1,
        estudanteId: 1,
        periodoLetivoId: 1,
        comprovanteResidenciaId: 1,
        historicoEscolarId: 1,
      });

      const depois = new Date();

      if (!expectToBeOk(result)) return;

      expect(result.value.dataCriacao.getTime()).toBeGreaterThanOrEqual(antes.getTime());
      expect(result.value.dataCriacao.getTime()).toBeLessThanOrEqual(depois.getTime());
    });

    it("deve aceitar status customizado", () => {
      const result = Matricula.criar({
        id: 1,
        unidadeId: 1,
        estudanteId: 1,
        periodoLetivoId: 1,
        status: StatusMatriculaEnum.Aprovada,
        comprovanteResidenciaId: 1,
        historicoEscolarId: 1,
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.status).toBe(StatusMatriculaEnum.Aprovada);
    });

    it("deve aceitar data de criação customizada", () => {
      const result = Matricula.criar({
        id: 1,
        unidadeId: 1,
        estudanteId: 1,
        periodoLetivoId: 1,
        dataCriacao: TEST_DATES.YESTERDAY,
        comprovanteResidenciaId: 1,
        historicoEscolarId: 1,
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.dataCriacao).toEqual(TEST_DATES.YESTERDAY);
    });
  });

  describe("Métodos de transição de status", () => {
    it("deve ativar matrícula", () => {
      const result = Matricula.criar({
        id: 1,
        unidadeId: 1,
        estudanteId: 1,
        periodoLetivoId: 1,
        status: StatusMatriculaEnum.Inativa,
        comprovanteResidenciaId: 1,
        historicoEscolarId: 1,
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.status).toBe(StatusMatriculaEnum.Inativa);
      expect(result.value.isAtiva()).toBe(false);

      result.value.ativar();
      expect(result.value.status).toBe(StatusMatriculaEnum.Ativa);
      expect(result.value.isAtiva()).toBe(true);
    });

    it("deve cancelar matrícula", () => {
      const result = Matricula.criar({
        id: 1,
        unidadeId: 1,
        estudanteId: 1,
        periodoLetivoId: 1,
        comprovanteResidenciaId: 1,
        historicoEscolarId: 1,
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.status).toBe(StatusMatriculaEnum.Ativa);

      result.value.cancelar();
      expect(result.value.status).toBe(StatusMatriculaEnum.Cancelada);
      expect(result.value.isCancelada()).toBe(true);
    });

    it("deve suspender matrícula", () => {
      const result = Matricula.criar({
        id: 1,
        unidadeId: 1,
        estudanteId: 1,
        periodoLetivoId: 1,
        comprovanteResidenciaId: 1,
        historicoEscolarId: 1,
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.status).toBe(StatusMatriculaEnum.Ativa);

      result.value.suspender();
      expect(result.value.status).toBe(StatusMatriculaEnum.Inativa);
      expect(result.value.isSuspensa()).toBe(true);
    });

    it("deve transitar entre diferentes status corretamente", () => {
      const result = Matricula.criar({
        id: 1,
        unidadeId: 1,
        estudanteId: 1,
        periodoLetivoId: 1,
        comprovanteResidenciaId: 1,
        historicoEscolarId: 1,
      });

      if (!expectToBeOk(result)) return;

      // Ativa -> Suspensa
      expect(result.value.isAtiva()).toBe(true);
      result.value.suspender();
      expect(result.value.isSuspensa()).toBe(true);

      // Suspensa -> Ativa
      result.value.ativar();
      expect(result.value.isAtiva()).toBe(true);

      // Ativa -> Cancelada
      result.value.cancelar();
      expect(result.value.isCancelada()).toBe(true);

      // Cancelada -> Ativa (can reactivate)
      result.value.ativar();
      expect(result.value.isAtiva()).toBe(true);
    });
  });

  describe("Métodos de verificação de status", () => {
    it("deve verificar se matrícula está ativa", () => {
      const result = Matricula.criar({
        id: 1,
        unidadeId: 1,
        estudanteId: 1,
        periodoLetivoId: 1,
        status: StatusMatriculaEnum.Ativa,
        comprovanteResidenciaId: 1,
        historicoEscolarId: 1,
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.isAtiva()).toBe(true);
      expect(result.value.isCancelada()).toBe(false);
      expect(result.value.isSuspensa()).toBe(false);
    });

    it("deve verificar se matrícula está cancelada", () => {
      const result = Matricula.criar({
        id: 1,
        unidadeId: 1,
        estudanteId: 1,
        periodoLetivoId: 1,
        status: StatusMatriculaEnum.Cancelada,
        comprovanteResidenciaId: 1,
        historicoEscolarId: 1,
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.isCancelada()).toBe(true);
      expect(result.value.isAtiva()).toBe(false);
      expect(result.value.isSuspensa()).toBe(false);
    });

    it("deve verificar se matrícula está suspensa", () => {
      const result = Matricula.criar({
        id: 1,
        unidadeId: 1,
        estudanteId: 1,
        periodoLetivoId: 1,
        status: StatusMatriculaEnum.Inativa,
        comprovanteResidenciaId: 1,
        historicoEscolarId: 1,
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.isSuspensa()).toBe(true);
      expect(result.value.isAtiva()).toBe(false);
      expect(result.value.isCancelada()).toBe(false);
    });
  });

  describe("Reconstituição", () => {
    it("deve reconstituir matrícula a partir de dados do banco de dados", () => {
      const matricula = Matricula.reconstituir({
        id: 1,
        unidadeId: 1,
        estudanteId: 1,
        periodoLetivoId: 1,
        status: StatusMatriculaEnum.Ativa,
        dataCriacao: TEST_DATES.YESTERDAY,
        comprovanteResidenciaId: 1,
        historicoEscolarId: 1,
      });

      expect(matricula).toBeInstanceOf(Matricula);
      expect(matricula.id).toBe(1);
      expect(matricula.unidadeId).toBe(1);
      expect(matricula.estudanteId).toBe(1);
      expect(matricula.periodoLetivoId).toBe(1);
      expect(matricula.status).toBe(StatusMatriculaEnum.Ativa);
      expect(matricula.dataCriacao).toEqual(TEST_DATES.YESTERDAY);
    });

    it("deve preservar todas as propriedades na reconstituição", () => {
      const matricula = Matricula.reconstituir({
        id: 999,
        unidadeId: 5,
        estudanteId: 123,
        periodoLetivoId: 456,
        status: StatusMatriculaEnum.Cancelada,
        dataCriacao: TEST_DATES.LAST_YEAR,
        comprovanteResidenciaId: 789,
        historicoEscolarId: 321,
      });

      expect(matricula.id).toBe(999);
      expect(matricula.unidadeId).toBe(5);
      expect(matricula.estudanteId).toBe(123);
      expect(matricula.periodoLetivoId).toBe(456);
      expect(matricula.status).toBe(StatusMatriculaEnum.Cancelada);
      expect(matricula.dataCriacao).toEqual(TEST_DATES.LAST_YEAR);
      expect(matricula.comprovanteResidenciaId).toBe(789);
      expect(matricula.historicoEscolarId).toBe(321);
    });
  });

  describe("Getters", () => {
    it("deve retornar todos os getters corretamente", () => {
      const result = Matricula.criar({
        id: 1,
        unidadeId: 1,
        estudanteId: 1,
        periodoLetivoId: 1,
        dataCriacao: TEST_DATES.YESTERDAY,
        comprovanteResidenciaId: 1,
        historicoEscolarId: 2,
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.unidadeId).toBe(1);
      expect(result.value.estudanteId).toBe(1);
      expect(result.value.periodoLetivoId).toBe(1);
      expect(result.value.dataCriacao).toEqual(TEST_DATES.YESTERDAY);
      expect(result.value.comprovanteResidenciaId).toBe(1);
      expect(result.value.historicoEscolarId).toBe(2);
    });
  });
});
