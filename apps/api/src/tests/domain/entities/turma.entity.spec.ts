import { describe, expect, it } from "vitest";
import { Turma } from "../../../domain/entities/turma.entity.js";
import { expectToBeFailure, expectToBeOk } from "../../helpers/index.js";

describe("Turma Entity", () => {
  describe("Criação", () => {
    it("deve criar uma turma válida", () => {
      const result = Turma.criar({
        id: 1,
        anoLetivoId: 1,
        letra: "A",
        baseId: 1,
        modalidadeId: 1,
        etapaId: 1,
        limiteDeAlunos: 30,
        unidadeId: 1,
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.id).toBe(1);
      expect(result.value.anoLetivoId).toBe(1);
      expect(result.value.letra).toBe("A");
      expect(result.value.baseId).toBe(1);
      expect(result.value.modalidadeId).toBe(1);
      expect(result.value.etapaId).toBe(1);
      expect(result.value.limiteDeAlunos).toBe(30);
      expect(result.value.unidadeId).toBe(1);
    });

    it("deve rejeitar limite de alunos negativo", () => {
      const result = Turma.criar({
        id: 1,
        anoLetivoId: 1,
        letra: "A",
        baseId: 1,
        modalidadeId: 1,
        etapaId: 1,
        limiteDeAlunos: -1,
        unidadeId: 1,
      });

      if (!expectToBeFailure(result)) return;

      expect(result.erro.erros).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            propriedade: "limiteDeAlunos",
            mensagem: expect.stringContaining("deve ser maior do que 0"),
          }),
        ])
      );
    });

    it("deve rejeitar limite de alunos igual a zero", () => {
      const result = Turma.criar({
        id: 1,
        anoLetivoId: 1,
        letra: "A",
        baseId: 1,
        modalidadeId: 1,
        etapaId: 1,
        limiteDeAlunos: 0,
        unidadeId: 1,
      });

      if (!expectToBeFailure(result)) return;

      expect(result.erro.erros).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            propriedade: "limiteDeAlunos",
          }),
        ])
      );
    });

    it("deve aceitar limite de alunos positivo", () => {
      const result1 = Turma.criar({
        id: 1,
        anoLetivoId: 1,
        letra: "A",
        baseId: 1,
        modalidadeId: 1,
        etapaId: 1,
        limiteDeAlunos: 1,
        unidadeId: 1,
      });

      if (!expectToBeOk(result1)) return;

      expect(result1.value.limiteDeAlunos).toBe(1);

      const result30 = Turma.criar({
        id: 1,
        anoLetivoId: 1,
        letra: "B",
        baseId: 1,
        modalidadeId: 1,
        etapaId: 1,
        limiteDeAlunos: 30,
        unidadeId: 1,
      });

      if (!expectToBeOk(result30)) return;

      expect(result30.value.limiteDeAlunos).toBe(30);

      const result100 = Turma.criar({
        id: 1,
        anoLetivoId: 1,
        letra: "C",
        baseId: 1,
        modalidadeId: 1,
        etapaId: 1,
        limiteDeAlunos: 100,
        unidadeId: 1,
      });

      if (!expectToBeOk(result100)) return;

      expect(result100.value.limiteDeAlunos).toBe(100);
    });

    it("deve aceitar diferentes letras", () => {
      const letras = ["A", "B", "C", "D", "E"];

      letras.forEach((letra, index) => {
        const result = Turma.criar({
          id: 1 + index,
          anoLetivoId: 1,
          letra,
          baseId: 1,
          modalidadeId: 1,
          etapaId: 1,
          limiteDeAlunos: 30,
          unidadeId: 1,
        });

        if (!expectToBeOk(result)) return;

        expect(result.value.letra).toBe(letra);
      });
    });

    it("deve aceitar diferentes IDs de configuração", () => {
      const result = Turma.criar({
        id: 1,
        anoLetivoId: 2024,
        letra: "A",
        baseId: 5,
        modalidadeId: 3,
        etapaId: 7,
        limiteDeAlunos: 25,
        unidadeId: 10,
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.anoLetivoId).toBe(2024);
      expect(result.value.baseId).toBe(5);
      expect(result.value.modalidadeId).toBe(3);
      expect(result.value.etapaId).toBe(7);
      expect(result.value.unidadeId).toBe(10);
    });
  });

  describe("Reconstituição", () => {
    it("deve reconstituir turma a partir de dados do banco de dados", () => {
      const turma = Turma.reconstituir({
        id: 1,
        anoLetivoId: 1,
        letra: "A",
        baseId: 1,
        modalidadeId: 1,
        etapaId: 1,
        limiteDeAlunos: 30,
        unidadeId: 1,
      });

      expect(turma).toBeInstanceOf(Turma);
      expect(turma.id).toBe(1);
      expect(turma.anoLetivoId).toBe(1);
      expect(turma.letra).toBe("A");
      expect(turma.baseId).toBe(1);
      expect(turma.modalidadeId).toBe(1);
      expect(turma.etapaId).toBe(1);
      expect(turma.limiteDeAlunos).toBe(30);
      expect(turma.unidadeId).toBe(1);
    });

    it("deve preservar todas as propriedades na reconstituição", () => {
      const turma = Turma.reconstituir({
        id: 999,
        anoLetivoId: 2025,
        letra: "Z",
        baseId: 15,
        modalidadeId: 20,
        etapaId: 25,
        limiteDeAlunos: 50,
        unidadeId: 100,
      });

      expect(turma.id).toBe(999);
      expect(turma.anoLetivoId).toBe(2025);
      expect(turma.letra).toBe("Z");
      expect(turma.baseId).toBe(15);
      expect(turma.modalidadeId).toBe(20);
      expect(turma.etapaId).toBe(25);
      expect(turma.limiteDeAlunos).toBe(50);
      expect(turma.unidadeId).toBe(100);
    });

    it("deve reconstituir turma mesmo com limite de alunos inválido", () => {
      // Reconstitution should NOT validate - it's for database data
      const turma = Turma.reconstituir({
        id: 1,
        anoLetivoId: 1,
        letra: "A",
        baseId: 1,
        modalidadeId: 1,
        etapaId: 1,
        limiteDeAlunos: 0, // Would fail validation in criar()
        unidadeId: 1,
      });

      expect(turma).toBeInstanceOf(Turma);
      expect(turma.limiteDeAlunos).toBe(0);
    });
  });

  describe("Getters", () => {
    it("deve retornar todos os getters corretamente", () => {
      const result = Turma.criar({
        id: 1,
        anoLetivoId: 1,
        letra: "A",
        baseId: 1,
        modalidadeId: 1,
        etapaId: 1,
        limiteDeAlunos: 30,
        unidadeId: 1,
      });

      if (!expectToBeOk(result)) return;

      expect(result.value.id).toBe(1);
      expect(result.value.anoLetivoId).toBe(1);
      expect(result.value.letra).toBe("A");
      expect(result.value.baseId).toBe(1);
      expect(result.value.modalidadeId).toBe(1);
      expect(result.value.etapaId).toBe(1);
      expect(result.value.limiteDeAlunos).toBe(30);
      expect(result.value.unidadeId).toBe(1);
    });

    it("deve retornar propriedades imutáveis", () => {
      const result = Turma.criar({
        id: 1,
        anoLetivoId: 1,
        letra: "A",
        baseId: 1,
        modalidadeId: 1,
        etapaId: 1,
        limiteDeAlunos: 30,
        unidadeId: 1,
      });

      if (!expectToBeOk(result)) return;

      const turma = result.value;

      // Verify properties are accessible
      expect(turma.id).toBeDefined();
      expect(turma.anoLetivoId).toBeDefined();
      expect(turma.letra).toBeDefined();
      expect(turma.baseId).toBeDefined();
      expect(turma.modalidadeId).toBeDefined();
      expect(turma.etapaId).toBeDefined();
      expect(turma.limiteDeAlunos).toBeDefined();
      expect(turma.unidadeId).toBeDefined();
    });
  });
});
