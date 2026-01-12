import { beforeEach, describe, expect, it } from "vitest";
import { CadastrarTurmaUseCase } from "../../../application/usecases/cadastrar-turma.usecase.js";
import { AnoLetivo } from "../../../domain/entities/ano-letivo.entity.js";
import { BaseCurricular } from "../../../domain/entities/base-curricular.entity.js";
import { UnidadeEscolar } from "../../../domain/entities/unidade-escolar.entity.js";
import { Turma } from "../../../domain/entities/turma.entity.js";
import {
  expectToBeFailure,
  expectToBeOk,
  InMemoryAnoLetivoRepository,
  InMemoryBaseCurricularRepository,
  InMemoryTurmaRepository,
  InMemoryUnidadeEscolarRepository,
  TEST_DATES,
  VALID_PHONES,
} from "../../helpers/index.js";
import { ValidationError } from "../../../domain/errors/validation.error.js";
import type {
  ModalidadesQueries,
  EtapaResponse,
  ModalidadeResponse,
  ModalidadeComMatriculaResponse,
} from "../../../application/queries/modalidades.queries.js";

class MockModalidadesQueries implements ModalidadesQueries {
  async listarModalidades(): Promise<ModalidadeResponse[]> {
    return [{ id: 1, nome: "Ensino Fundamental" }];
  }

  async listarEtapas(modalidadeId: number): Promise<EtapaResponse[]> {
    return [
      { id: 1, numero: 1, nome: "1º Ano" },
      { id: 2, numero: 2, nome: "2º Ano" },
    ];
  }

  async listarTodasEtapas(): Promise<(EtapaResponse & { readonly modalidadeId: number })[]> {
    return [
      { id: 1, numero: 1, nome: "1º Ano", modalidadeId: 1 },
      { id: 2, numero: 2, nome: "2º Ano", modalidadeId: 1 },
    ];
  }

  async obterModalidadePorId(id: number): Promise<ModalidadeResponse | null> {
    if (id === 1) return { id: 1, nome: "Ensino Fundamental" };
    return null;
  }

  async obterEtapaPorId(id: number): Promise<(EtapaResponse & { readonly modalidadeId: number }) | null> {
    if (id === 1) return { id: 1, numero: 1, nome: "1º Ano", modalidadeId: 1 };
    if (id === 2) return { id: 2, numero: 2, nome: "2º Ano", modalidadeId: 1 };
    return null;
  }

  async obterModalidadesComMatriculas(
    unidadeId: number,
    anoLetivoId: number
  ): Promise<ModalidadeComMatriculaResponse[]> {
    return [];
  }
}

describe("CadastrarTurmaUseCase", () => {
  let useCase: CadastrarTurmaUseCase;
  let anoLetivoRepository: InMemoryAnoLetivoRepository;
  let baseCurricularRepository: InMemoryBaseCurricularRepository;
  let turmaRepository: InMemoryTurmaRepository;
  let unidadeEscolarRepository: InMemoryUnidadeEscolarRepository;
  let modalidadesQueries: MockModalidadesQueries;
  let unidadeId: number;
  let anoLetivoId: number;

  beforeEach(async () => {
    anoLetivoRepository = new InMemoryAnoLetivoRepository();
    baseCurricularRepository = new InMemoryBaseCurricularRepository();
    turmaRepository = new InMemoryTurmaRepository();
    unidadeEscolarRepository = new InMemoryUnidadeEscolarRepository();
    modalidadesQueries = new MockModalidadesQueries();

    useCase = new CadastrarTurmaUseCase(
      anoLetivoRepository,
      baseCurricularRepository,
      turmaRepository,
      unidadeEscolarRepository,
      modalidadesQueries
    );

    // Seed ano letivo
    const anoLetivo = new AnoLetivo({
      id: 1,
      anoReferencia: new Date().getFullYear(),
      dataInicio: TEST_DATES.SCHOOL_YEAR_START,
      dataFim: TEST_DATES.SCHOOL_YEAR_END,
      escolaId: 1,
    });

	anoLetivoId = anoLetivo.id;
    anoLetivoRepository.seed([anoLetivo]);

    // Seed unidade escolar
    const unidade = new UnidadeEscolar({
      id: await unidadeEscolarRepository.obterProximoId(),
      nome: "Unidade Centro",
      email: "centro@escola.com",
      cnpj: "12.345.678/0001-90",
      telefone1: VALID_PHONES.LANDLINE_SP,
      escolaId: 1,
      dataDeCriacao: new Date(),
    });

	unidadeId = unidade.id;

    unidadeEscolarRepository.seed([unidade]);

    // Seed base curricular
    const baseCurricular = new BaseCurricular({
      id: 1,
      codigo: "BASE-001",
      dataCriacao: new Date(),
      etapaId: 1,
      unidadeId: unidade.id,
      disciplinas: [
        {
          id: 1,
          nome: "Matemática",
          slug: "matematica",
          codigo: "MAT",
          cargaHorariaAnual: 200,
        },
      ],
    });
    baseCurricularRepository.seed([baseCurricular]);
  });

  describe("Sucesso - Criação de turma", () => {
    it("deve criar turma com dados válidos", async () => {
      // Arrange
      const request = {
        anoLetivoId: 1,
        baseId: 1,
        letra: "A",
        unidadeId: 1,
        limiteDeAlunos: 30,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeOk(result)) {
        expect(result.value.id).toBeGreaterThan(0);
        expect(result.value.letra).toBe("A");
        expect(result.value.limiteDeAlunos).toBe(30);
        expect(result.value.anoLetivoId).toBe(anoLetivoId);
        expect(result.value.baseId).toBe(1);
        expect(result.value.etapaId).toBe(1);
        expect(result.value.unidadeId).toBe(unidadeId);

        // Verificar que foi salva
        const turmas = turmaRepository.getAll();
        expect(turmas).toHaveLength(1);
      }
    });

    it("deve criar múltiplas turmas com letras diferentes", async () => {
      // Arrange & Act: Criar turmas A, B e C
      const turmaA = {
        anoLetivoId: anoLetivoId,
        baseId: 1,
        letra: "A",
        unidadeId: unidadeId,
        limiteDeAlunos: 30,
      };

      const turmaB = {
        anoLetivoId: anoLetivoId,
        baseId: 1,
        letra: "B",
        unidadeId: unidadeId,
        limiteDeAlunos: 25,
      };

      const turmaC = {
        anoLetivoId: anoLetivoId,
        baseId: 1,
        letra: "C",
        unidadeId: unidadeId,
        limiteDeAlunos: 28,
      };

      const resultA = await useCase.executar(turmaA);
      const resultB = await useCase.executar(turmaB);
      const resultC = await useCase.executar(turmaC);

      // Assert
      expectToBeOk(resultA);
      expectToBeOk(resultB);
      expectToBeOk(resultC);

      const turmas = turmaRepository.getAll();
      expect(turmas).toHaveLength(3);
    });
  });

  describe("Falha - Letra duplicada", () => {
    it("deve retornar ConflictError quando já existe turma com a mesma letra no mesmo ano e etapa", async () => {
      // Arrange: Criar turma A
      const turmaExistenteResult = Turma.criar({
        id: await turmaRepository.obterProximoId(),
        anoLetivoId: anoLetivoId,
        letra: "A",
        baseId: 1,
        modalidadeId: 1,
        etapaId: 1,
        limiteDeAlunos: 30,
        unidadeId: unidadeId,
      });

      if (!expectToBeOk(turmaExistenteResult)) return;

      const turmaExistente = turmaExistenteResult.value;
      await turmaRepository.salvar(turmaExistente);

      const request = {
        anoLetivoId: anoLetivoId,
        baseId: 1,
        letra: "A", // Mesma letra
        unidadeId: unidadeId,
        limiteDeAlunos: 30,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeFailure(result)) {
        expect(result.erro.type).toBe("conflict");
        expect(result.erro.message).toContain("Já existe uma turma com essa letra");
      }
    });

    it("deve permitir mesma letra em anos letivos diferentes", async () => {
      // Arrange: Criar turma A no ano atual
      const turmaExistenteResult = Turma.criar({
        id: await turmaRepository.obterProximoId(),
        anoLetivoId: anoLetivoId,
        letra: "A",
        baseId: 1,
        modalidadeId: 1,
        etapaId: 1,
        limiteDeAlunos: 30,
        unidadeId: unidadeId,
      });

      if (!expectToBeOk(turmaExistenteResult)) return;

      const turmaExistente = turmaExistenteResult.value;
      await turmaRepository.salvar(turmaExistente);

      // Criar outro ano letivo
      const outroAnoLetivo = new AnoLetivo({
        id: 2,
        anoReferencia: new Date().getFullYear() + 1,
        dataInicio: new Date(new Date().getFullYear() + 1, 1, 1),
        dataFim: new Date(new Date().getFullYear() + 1, 11, 15),
        escolaId: 1,
      });
      anoLetivoRepository.seed([...anoLetivoRepository.getAll(), outroAnoLetivo]);

      // Criar base curricular para o novo ano
      const outraBase = new BaseCurricular({
        id: 2,
        codigo: "BASE-002",
        dataCriacao: new Date(),
        etapaId: 1,
        unidadeId: unidadeId,
        disciplinas: [
          {
            id: 1,
            nome: "Matemática",
            slug: "matematica",
            codigo: "MAT",
            cargaHorariaAnual: 200,
          },
        ],
      });
      baseCurricularRepository.seed([...baseCurricularRepository.getAll(), outraBase]);

      const request = {
        anoLetivoId: 2, // Ano diferente
        baseId: 2,
        letra: "A", // Mesma letra, mas ano diferente
        unidadeId: unidadeId,
        limiteDeAlunos: 30,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert: Deve ter sucesso
      expectToBeOk(result);
    });

    it("deve permitir mesma letra em etapas diferentes", async () => {
      // Arrange: Criar turma A na etapa 1
      const turmaExistenteResult = Turma.criar({
        id: await turmaRepository.obterProximoId(),
        anoLetivoId: anoLetivoId,
        letra: "A",
        baseId: 1,
        modalidadeId: 1,
        etapaId: 1,
        limiteDeAlunos: 30,
        unidadeId: unidadeId,
      });

      if (!expectToBeOk(turmaExistenteResult)) return;

      const turmaExistente = turmaExistenteResult.value;
      await turmaRepository.salvar(turmaExistente);

      // Criar base curricular para etapa 2
      const outraBase = new BaseCurricular({
        id: 2,
        codigo: "BASE-002",
        dataCriacao: new Date(),
        etapaId: 2, // Etapa diferente
        unidadeId: unidadeId,
        disciplinas: [
          {
            id: 1,
            nome: "Matemática",
            slug: "matematica",
            codigo: "MAT",
            cargaHorariaAnual: 200,
          },
        ],
      });
      baseCurricularRepository.seed([...baseCurricularRepository.getAll(), outraBase]);

      const request = {
        anoLetivoId: anoLetivoId,
        baseId: 2,
        letra: "A", // Mesma letra, mas etapa diferente
        unidadeId: unidadeId,
        limiteDeAlunos: 30,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert: Deve ter sucesso
      expectToBeOk(result);
    });
  });

  describe("Falha - Validações de existência", () => {
    it("deve retornar IllegalArgumentError quando ano letivo não existe", async () => {
      // Arrange
      const request = {
        anoLetivoId: 999, // Ano inexistente
        baseId: 1,
        letra: "A",
        unidadeId: unidadeId,
        limiteDeAlunos: 30,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeFailure(result)) {
        expect(result.erro.type).toBe("illegal-argument");
        expect(result.erro.message).toContain("Ano letivo com id 999 não existe");
      }
    });

    it("deve retornar IllegalArgumentError quando base curricular não existe", async () => {
      // Arrange
      const request = {
        anoLetivoId: anoLetivoId,
        baseId: 999, // Base inexistente
        letra: "A",
        unidadeId: unidadeId,
        limiteDeAlunos: 30,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeFailure(result)) {
        expect(result.erro.type).toBe("illegal-argument");
        expect(result.erro.message).toContain("Base curricular com id 999 não existe");
      }
    });

    it("deve retornar IllegalArgumentError quando unidade escolar não existe", async () => {
      // Arrange
      const request = {
        anoLetivoId: anoLetivoId,
        baseId: 1,
        letra: "A",
        unidadeId: 999, // Unidade inexistente
        limiteDeAlunos: 30,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeFailure(result)) {
        expect(result.erro.type).toBe("illegal-argument");
        expect(result.erro.message).toContain("Unidade escolar com id 999 não existe");
      }
    });
  });

  describe("Validações da entidade Turma", () => {
    it("deve validar limite de alunos mínimo", async () => {
      // Arrange
      const request = {
        anoLetivoId: anoLetivoId,
        baseId: 1,
        letra: "A",
        unidadeId: unidadeId,
        limiteDeAlunos: 0, // Limite inválido
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeFailure(result)) {
        expect(result.erro).toBeInstanceOf(ValidationError);

        expect((result.erro as ValidationError).erros).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              propriedade: "limiteDeAlunos",
            }),
          ])
        );
      }
    });

    it("deve aceitar letra vazia", async () => {
      // Arrange
      const request = {
        anoLetivoId: anoLetivoId,
        baseId: 1,
        letra: "", // Letra vazia é permitida pela entidade
        unidadeId: unidadeId,
        limiteDeAlunos: 30,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert: Deve ter sucesso pois a entidade Turma não valida letra vazia
      if (expectToBeOk(result)) {
        expect(result.value.letra).toBe("");
      }
    });

    it("deve aceitar letras maiúsculas e minúsculas", async () => {
      // Arrange & Act: Criar turma com letra minúscula
      const requestMinuscula = {
        anoLetivoId: anoLetivoId,
        baseId: 1,
        letra: "a",
        unidadeId: unidadeId,
        limiteDeAlunos: 30,
      };

      const resultMinuscula = await useCase.executar(requestMinuscula);

      // Assert
      expectToBeOk(resultMinuscula);

      // Reset
      turmaRepository.reset();

      // Arrange & Act: Criar turma com letra maiúscula
      const requestMaiuscula = {
        anoLetivoId: anoLetivoId,
        baseId: 1,
        letra: "A",
        unidadeId: unidadeId,
        limiteDeAlunos: 30,
      };

      const resultMaiuscula = await useCase.executar(requestMaiuscula);

      // Assert
      expectToBeOk(resultMaiuscula);
    });
  });

  describe("Casos especiais", () => {
    it("deve aceitar limites de alunos variados", async () => {
      // Arrange & Act: Limites pequenos e grandes
      const turma1 = await useCase.executar({
        anoLetivoId: anoLetivoId,
        baseId: 1,
        letra: "A",
        unidadeId: unidadeId,
        limiteDeAlunos: 10, // Limite pequeno
      });

      const turma2 = await useCase.executar({
        anoLetivoId: anoLetivoId,
        baseId: 1,
        letra: "B",
        unidadeId: unidadeId,
        limiteDeAlunos: 50, // Limite grande
      });

      // Assert
      expectToBeOk(turma1);
      expectToBeOk(turma2);
    });

    it("deve obter etapaId da base curricular", async () => {
      // Arrange
      const request = {
        anoLetivoId: anoLetivoId,
        baseId: 1,
        letra: "A",
        unidadeId: unidadeId,
        limiteDeAlunos: 30,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeOk(result)) {
        // A etapa deve ser obtida da base curricular (etapaId: 1)
        expect(result.value.etapaId).toBe(1);
      }
    });

    it("deve gerar IDs sequenciais", async () => {
      // Arrange & Act
      const result1 = await useCase.executar({
        anoLetivoId: anoLetivoId,
        baseId: 1,
        letra: "A",
        unidadeId: unidadeId,
        limiteDeAlunos: 30,
      });

      const result2 = await useCase.executar({
        anoLetivoId: anoLetivoId,
        baseId: 1,
        letra: "B",
        unidadeId: unidadeId,
        limiteDeAlunos: 30,
      });

      // Assert
      if (expectToBeOk(result1) && expectToBeOk(result2)) {
        expect(result2.value.id).toBe(result1.value.id + 1);
      }
    });
  });
});
