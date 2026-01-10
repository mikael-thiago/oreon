import { beforeEach, describe, expect, it } from "vitest";
import type { UsuarioAutenticado } from "../../../application/types/authenticated-user.type.js";
import { CadastrarAnoLetivoUseCase } from "../../../application/usecases/cadastrar-ano-letivo.usecase.js";
import { AnoLetivo } from "../../../domain/entities/ano-letivo.entity.js";
import { expectToBeFailure, expectToBeOk, InMemoryAnoLetivoRepository } from "../../helpers/index.js";

describe("CadastrarAnoLetivoUseCase", () => {
  let useCase: CadastrarAnoLetivoUseCase;
  let anoLetivoRepository: InMemoryAnoLetivoRepository;

  const usuarioAutenticado: UsuarioAutenticado = {
    id: 1,
    escolaId: 1,
    email: "",
  };

  beforeEach(() => {
    anoLetivoRepository = new InMemoryAnoLetivoRepository();
    useCase = new CadastrarAnoLetivoUseCase(anoLetivoRepository);
  });

  describe("Sucesso - Criação de ano letivo", () => {
    it("deve criar ano letivo com dados válidos", async () => {
      // Arrange
      const anoAtual = new Date().getFullYear();
      const request = {
        anoReferencia: anoAtual,
        dataInicio: new Date(anoAtual, 1, 1), // 1 de fevereiro
        dataFim: new Date(anoAtual, 11, 15), // 15 de dezembro
        usuario: usuarioAutenticado,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeOk(result)) {
        expect(result.value).toBeInstanceOf(AnoLetivo);
        expect(result.value.id).toBeGreaterThan(0);
        expect(result.value.ano).toBe(anoAtual);
        expect(result.value.dataInicio).toEqual(request.dataInicio);
        expect(result.value.dataFim).toEqual(request.dataFim);
        expect(result.value.escolaId).toBe(1);

        // Verificar que foi salvo
        const anosLetivos = anoLetivoRepository.getAll();
        expect(anosLetivos).toHaveLength(1);
      }
    });

    it("deve criar múltiplos anos letivos para a mesma escola", async () => {
      // Arrange & Act: Criar ano letivo 2024
      const ano2024 = {
        anoReferencia: 2024,
        dataInicio: new Date(2024, 1, 1),
        dataFim: new Date(2024, 11, 15),
        usuario: usuarioAutenticado,
      };
      const result2024 = await useCase.executar(ano2024);

      // Criar ano letivo 2025
      const ano2025 = {
        anoReferencia: 2025,
        dataInicio: new Date(2025, 1, 1),
        dataFim: new Date(2025, 11, 15),
        usuario: usuarioAutenticado,
      };
      const result2025 = await useCase.executar(ano2025);

      // Assert
      expectToBeOk(result2024);
      expectToBeOk(result2025);

      const anosLetivos = anoLetivoRepository.getAll();
      expect(anosLetivos).toHaveLength(2);
    });
  });

  describe("Falha - Ano duplicado", () => {
    it("deve retornar ConflictError quando já existe ano letivo com o mesmo ano", async () => {
      // Arrange: Criar ano letivo existente
      const anoAtual = new Date().getFullYear();
      const anoLetivoExistente = new AnoLetivo({
        id: 1,
        anoReferencia: anoAtual,
        dataInicio: new Date(anoAtual, 1, 1),
        dataFim: new Date(anoAtual, 11, 15),
        escolaId: 1,
      });
      await anoLetivoRepository.salvar(anoLetivoExistente);

      const request = {
        anoReferencia: anoAtual, // Mesmo ano
        dataInicio: new Date(anoAtual, 0, 15), // Datas diferentes
        dataFim: new Date(anoAtual, 10, 30),
        usuario: usuarioAutenticado,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeFailure(result)) {
        expect(result.erro.type).toBe("conflict");
        expect(result.erro.message).toContain("Ano letivo com mesmo ano já existe");
      }
    });

    it("deve permitir mesmo ano para escolas diferentes", async () => {
      // Arrange: Criar ano letivo para outra escola
      const anoAtual = new Date().getFullYear();
      const anoLetivoOutraEscola = new AnoLetivo({
        id: 1,
        anoReferencia: anoAtual,
        dataInicio: new Date(anoAtual, 1, 1),
        dataFim: new Date(anoAtual, 11, 15),
        escolaId: 999, // Outra escola
      });
      await anoLetivoRepository.salvar(anoLetivoOutraEscola);

      const request = {
        anoReferencia: anoAtual, // Mesmo ano
        dataInicio: new Date(anoAtual, 1, 1),
        dataFim: new Date(anoAtual, 11, 15),
        usuario: usuarioAutenticado, // Escola diferente
      };

      // Act
      const result = await useCase.executar(request);

      // Assert: Deve ter sucesso
      expectToBeOk(result);
    });
  });

  describe("Falha - Datas sobrepostas", () => {
    it("deve retornar ConflictError quando as datas se sobrepõem completamente", async () => {
      // Arrange: Criar ano letivo existente
      const anoAtual = new Date().getFullYear();
      const anoLetivoExistente = new AnoLetivo({
        id: 1,
        anoReferencia: anoAtual,
        dataInicio: new Date(anoAtual, 1, 1),
        dataFim: new Date(anoAtual, 11, 15),
        escolaId: 1,
      });
      await anoLetivoRepository.salvar(anoLetivoExistente);

      // Tentar criar com datas que englobam o existente
      const request = {
        anoReferencia: anoAtual + 1, // Ano diferente
        dataInicio: new Date(anoAtual, 0, 1), // Antes do existente
        dataFim: new Date(anoAtual, 11, 31), // Depois do existente
        usuario: usuarioAutenticado,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeFailure(result)) {
        expect(result.erro.type).toBe("conflict");
        expect(result.erro.message).toContain("Ano letivo que contempla as datas informadas já existe");
      }
    });

    it("deve retornar ConflictError quando data de início está dentro de outro período", async () => {
      // Arrange: Criar ano letivo existente
      const anoAtual = new Date().getFullYear();
      const anoLetivoExistente = new AnoLetivo({
        id: 1,
        anoReferencia: anoAtual,
        dataInicio: new Date(anoAtual, 1, 1),
        dataFim: new Date(anoAtual, 11, 15),
        escolaId: 1,
      });
      await anoLetivoRepository.salvar(anoLetivoExistente);

      // Tentar criar com data início dentro do existente
      const request = {
        anoReferencia: anoAtual + 1,
        dataInicio: new Date(anoAtual, 5, 1), // Dentro do período existente
        dataFim: new Date(anoAtual + 1, 2, 1),
        usuario: usuarioAutenticado,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeFailure(result)) {
        expect(result.erro.type).toBe("conflict");
      }
    });

    it("deve retornar ConflictError quando data de fim está dentro de outro período", async () => {
      // Arrange: Criar ano letivo existente
      const anoAtual = new Date().getFullYear();
      const anoLetivoExistente = new AnoLetivo({
        id: 1,
        anoReferencia: anoAtual,
        dataInicio: new Date(anoAtual, 1, 1),
        dataFim: new Date(anoAtual, 11, 15),
        escolaId: 1,
      });
      await anoLetivoRepository.salvar(anoLetivoExistente);

      // Tentar criar com data fim dentro do existente
      const request = {
        anoReferencia: anoAtual - 1,
        dataInicio: new Date(anoAtual - 1, 10, 1),
        dataFim: new Date(anoAtual, 3, 1), // Dentro do período existente
        usuario: usuarioAutenticado,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeFailure(result)) {
        expect(result.erro.type).toBe("conflict");
      }
    });

    it("deve permitir períodos consecutivos sem sobreposição", async () => {
      // Arrange: Criar ano letivo 2024
      const anoLetivoExistente = new AnoLetivo({
        id: 1,
        anoReferencia: 2024,
        dataInicio: new Date(2024, 1, 1),
        dataFim: new Date(2024, 11, 15),
        escolaId: 1,
      });
      await anoLetivoRepository.salvar(anoLetivoExistente);

      // Tentar criar ano 2025 começando depois do fim de 2024
      const request = {
        anoReferencia: 2025,
        dataInicio: new Date(2024, 11, 16), // Um dia depois do fim de 2024
        dataFim: new Date(2025, 11, 15),
        usuario: usuarioAutenticado,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert: Não deve ter sobreposição
      expectToBeOk(result);
    });
  });

  describe("Casos especiais", () => {
    it("deve aceitar anos letivos de anos diferentes da mesma escola", async () => {
      // Arrange & Act
      const ano2024 = {
        anoReferencia: 2024,
        dataInicio: new Date(2024, 1, 1),
        dataFim: new Date(2024, 11, 15),
        usuario: usuarioAutenticado,
      };

      const ano2025 = {
        anoReferencia: 2025,
        dataInicio: new Date(2025, 1, 1),
        dataFim: new Date(2025, 11, 15),
        usuario: usuarioAutenticado,
      };

      const result2024 = await useCase.executar(ano2024);
      const result2025 = await useCase.executar(ano2025);

      // Assert
      expectToBeOk(result2024);
      expectToBeOk(result2025);

      const anosLetivos = anoLetivoRepository.getAll();
      expect(anosLetivos).toHaveLength(2);
    });

    it("deve aceitar período que abrange virada de ano", async () => {
      // Arrange
      const request = {
        anoReferencia: 2024,
        dataInicio: new Date(2023, 11, 1), // Dezembro 2023
        dataFim: new Date(2024, 11, 15), // Dezembro 2024
        usuario: usuarioAutenticado,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert: Deve ter sucesso
      expectToBeOk(result);
    });

    it("deve gerar IDs sequenciais", async () => {
      // Arrange & Act
      const request1 = {
        anoReferencia: 2024,
        dataInicio: new Date(2024, 1, 1),
        dataFim: new Date(2024, 11, 15),
        usuario: usuarioAutenticado,
      };

      const request2 = {
        anoReferencia: 2025,
        dataInicio: new Date(2025, 1, 1),
        dataFim: new Date(2025, 11, 15),
        usuario: usuarioAutenticado,
      };

      const result1 = await useCase.executar(request1);
      const result2 = await useCase.executar(request2);

      // Assert
      if (expectToBeOk(result1) && expectToBeOk(result2)) {
        expect(result2.value.id).toBe(result1.value.id + 1);
      }
    });

    it("deve preservar dados informados na criação", async () => {
      // Arrange
      const anoAtual = new Date().getFullYear();
      const dataInicio = new Date(anoAtual, 2, 15, 10, 30, 45); // Com horário
      const dataFim = new Date(anoAtual, 10, 20, 18, 45, 30);

      const request = {
        anoReferencia: anoAtual,
        dataInicio,
        dataFim,
        usuario: usuarioAutenticado,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeOk(result)) {
        expect(result.value.dataInicio).toEqual(dataInicio);
        expect(result.value.dataFim).toEqual(dataFim);
        expect(result.value.ano).toBe(anoAtual);
        expect(result.value.escolaId).toBe(1);
      }
    });
  });
});
