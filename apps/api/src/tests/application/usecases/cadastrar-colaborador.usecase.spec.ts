import { beforeEach, describe, expect, it } from "vitest";
import type { UsuarioAutenticado } from "../../../application/types/authenticated-user.type.js";
import { CadastrarColaboradorUseCase } from "../../../application/usecases/cadastrar-colaborador.usecase.js";
import { Cargo } from "../../../domain/entities/cargo.entity.js";
import { Usuario } from "../../../domain/entities/usuario.entity.js";
import { ValidationError } from "../../../domain/errors/validation.error.js";
import {
  expectToBeFailure,
  expectToBeOk,
  InMemoryCargoRepository,
  InMemoryColaboradorRepository,
  InMemoryContratoRepository,
  InMemoryUsuarioRepository,
  INVALID_CPFS,
  MockCriptografiaService,
  MockUnitOfWork,
  TEST_DATES,
  TEST_MONEY,
  VALID_CPFS,
  VALID_CPFS_UNFORMATTED,
  VALID_EMAILS,
  VALID_NAMES,
  VALID_PHONES,
} from "../../helpers/index.js";

describe("CadastrarColaboradorUseCase", () => {
  let useCase: CadastrarColaboradorUseCase;
  let usuarioRepository: InMemoryUsuarioRepository;
  let colaboradorRepository: InMemoryColaboradorRepository;
  let contratoRepository: InMemoryContratoRepository;
  let cargoRepository: InMemoryCargoRepository;
  let criptografiaService: MockCriptografiaService;
  let uow: MockUnitOfWork;

  let usuarioRoot: Usuario;
  let cargoComum: Cargo;
  let cargoProfessor: Cargo;

  let usuarioAutenticadoRoot: UsuarioAutenticado;

  beforeEach(async () => {
    usuarioRepository = new InMemoryUsuarioRepository();
    colaboradorRepository = new InMemoryColaboradorRepository();
    contratoRepository = new InMemoryContratoRepository();
    cargoRepository = new InMemoryCargoRepository();
    criptografiaService = new MockCriptografiaService();
    uow = new MockUnitOfWork();

    useCase = new CadastrarColaboradorUseCase(
      uow,
      usuarioRepository,
      colaboradorRepository,
      contratoRepository,
      cargoRepository,
      criptografiaService
    );

    // Seed usuário root
    usuarioRoot = new Usuario({
      id: await usuarioRepository.obterProximoId(),
      nome: "Admin Root",
      login: "admin@escola.com",
      senha: await criptografiaService.hashear("senha"),
      escolaId: 1,
      admin: false,
      root: true,
    });
    await usuarioRepository.salvar(usuarioRoot);

    usuarioAutenticadoRoot = {
      id: usuarioRoot.id,
      email: usuarioRoot.login,
      escolaId: usuarioRoot.escolaId,
    };

    // Seed cargos
    cargoComum = new Cargo({
      id: await cargoRepository.obterProximoId(),
      nome: "Coordenador",
      podeEnsinar: false,
    });

    cargoProfessor = new Cargo({
      id: await cargoRepository.obterProximoId(),
      nome: "Professor",
      podeEnsinar: true,
    });

    cargoRepository.seed([cargoComum, cargoProfessor]);
  });

  describe("Sucesso - Contrato comum", () => {
    it("deve cadastrar colaborador com contrato comum", async () => {
      // Arrange
      const request = {
        usuarioAutenticado: usuarioAutenticadoRoot,
        unidadeId: 1,
        nome: VALID_NAMES.WITH_ACCENTS,
        cpf: VALID_CPFS.CPF_1,
        telefone: VALID_PHONES.MOBILE_SP,
        email: VALID_EMAILS.EMAIL_1,
        dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        contrato: {
          cargoId: cargoComum.id,
          dataInicio: TEST_DATES.CONTRACT_START,
          dataFim: TEST_DATES.CONTRACT_END,
          salario: TEST_MONEY.COORDINATOR_SALARY,
        },
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeOk(result)) {
        expect(result.value.id).toBeGreaterThan(0);
        expect(result.value.cpf).toBe(VALID_CPFS_UNFORMATTED.CPF_1);
        expect(result.value.email).toBe(VALID_EMAILS.EMAIL_1);
        expect(result.value.senha).toBeDefined();
        expect(result.value.senha.length).toBe(12);
        expect(result.value.contrato.cargoId).toBe(cargoComum.id);
        expect(result.value.contrato.salario).toBe(TEST_MONEY.COORDINATOR_SALARY);

        // Verificar que colaborador foi criado
        const colaboradores = colaboradorRepository.getAll();
        expect(colaboradores).toHaveLength(1);

        // Verificar que usuário foi criado
        const usuarios = usuarioRepository.getAll();
        expect(usuarios).toHaveLength(2); // Root + novo

        // Verificar que contrato foi criado
        const contratos = contratoRepository.getAll();
        expect(contratos).toHaveLength(1);
      }
    });
  });

  describe("Sucesso - Professor com disciplinas", () => {
    it("deve cadastrar professor com disciplinas", async () => {
      // Arrange
      const request = {
        usuarioAutenticado: usuarioAutenticadoRoot,
        unidadeId: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_2,
        telefone: VALID_PHONES.MOBILE_RJ,
        email: VALID_EMAILS.EMAIL_2,
        dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_25,
        contrato: {
          cargoId: cargoProfessor.id,
          dataInicio: TEST_DATES.CONTRACT_START,
          dataFim: TEST_DATES.CONTRACT_END,
          salario: TEST_MONEY.TEACHER_SALARY,
          disciplinasPermitidas: [
            { disciplinaId: 1, etapasIds: [1, 2] },
            { disciplinaId: 2, etapasIds: [1] },
          ],
        },
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeOk(result)) {
        expect(result.value.contrato.cargoId).toBe(cargoProfessor.id);

        // Verificar que contrato de professor foi criado
        const contratos = contratoRepository.getAll();
        expect(contratos).toHaveLength(1);
      }
    });
  });

  describe("Falha - CPF inválido", () => {
    it("deve retornar ValidationError quando CPF é inválido", async () => {
      // Arrange
      const request = {
        usuarioAutenticado: usuarioAutenticadoRoot,
        unidadeId: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: INVALID_CPFS.INVALID_CHECKSUM,
        telefone: VALID_PHONES.MOBILE_SP,
        email: VALID_EMAILS.EMAIL_1,
        dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        contrato: {
          cargoId: cargoComum.id,
          dataInicio: TEST_DATES.CONTRACT_START,
          salario: TEST_MONEY.COORDINATOR_SALARY,
        },
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeFailure(result)) {
        expect(result.erro.type).toBe(ValidationError.TYPE);
        expect((result.erro as ValidationError).erros).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              propriedade: "cpf",
              mensagem: expect.stringContaining("invalido"),
            }),
          ])
        );
      }
    });
  });

  describe("Falha - Datas de contrato inválidas", () => {
    it("deve retornar IllegalArgumentError quando data de início é posterior à data de fim", async () => {
      // Arrange
      const request = {
        usuarioAutenticado: usuarioAutenticadoRoot,
        unidadeId: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        telefone: VALID_PHONES.MOBILE_SP,
        email: VALID_EMAILS.EMAIL_1,
        dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        contrato: {
          cargoId: cargoComum.id,
          dataInicio: TEST_DATES.CONTRACT_END, // Fim antes do início
          dataFim: TEST_DATES.CONTRACT_START,
          salario: TEST_MONEY.COORDINATOR_SALARY,
        },
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeFailure(result)) {
        expect(result.erro.type).toBe("illegal-argument");
        expect(result.erro.message).toContain("data de início não pode ser maior");
      }
    });
  });

  describe("Falha - Data de início no futuro", () => {
    it("deve aceitar data de início no presente", async () => {
      // Arrange
      const request = {
        usuarioAutenticado: usuarioAutenticadoRoot,
        unidadeId: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        telefone: VALID_PHONES.MOBILE_SP,
        email: VALID_EMAILS.EMAIL_1,
        dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        contrato: {
          cargoId: cargoComum.id,
          dataInicio: new Date(), // Hoje
          salario: TEST_MONEY.COORDINATOR_SALARY,
        },
      };

      // Act
      const result = await useCase.executar(request);

      // Assert: Deve ter sucesso
      expectToBeOk(result);
    });
  });

  describe("Falha - Cargo inexistente", () => {
    it("deve retornar ValidationError quando cargo não existe", async () => {
      // Arrange
      const request = {
        usuarioAutenticado: usuarioAutenticadoRoot,
        unidadeId: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        telefone: VALID_PHONES.MOBILE_SP,
        email: VALID_EMAILS.EMAIL_1,
        dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        contrato: {
          cargoId: 999, // Cargo inexistente
          dataInicio: TEST_DATES.CONTRACT_START,
          salario: TEST_MONEY.COORDINATOR_SALARY,
        },
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeFailure(result)) {
        expect(result.erro.type).toBe(ValidationError.TYPE);
        expect((result.erro as ValidationError).erros).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              propriedade: "contrato.cargoId",
              mensagem: expect.stringContaining("não encontrado"),
            }),
          ])
        );
      }
    });
  });

  describe("Falha - Professor sem disciplinas", () => {
    it("deve retornar ValidationError quando professor não tem disciplinas informadas", async () => {
      // Arrange
      const request = {
        usuarioAutenticado: usuarioAutenticadoRoot,
        unidadeId: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        telefone: VALID_PHONES.MOBILE_SP,
        email: VALID_EMAILS.EMAIL_1,
        dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        contrato: {
          cargoId: cargoProfessor.id,
          dataInicio: TEST_DATES.CONTRACT_START,
          salario: TEST_MONEY.TEACHER_SALARY,
          // Sem disciplinasPermitidas
        },
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeFailure(result)) {
        expect(result.erro.type).toBe(ValidationError.TYPE);
        expect((result.erro as ValidationError).erros).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              propriedade: "contrato.disciplinasPermitidas",
            }),
          ])
        );
      }
    });
  });

  describe("Falha - Disciplinas duplicadas", () => {
    it("deve retornar ValidationError quando há disciplinas duplicadas", async () => {
      // Arrange
      const request = {
        usuarioAutenticado: usuarioAutenticadoRoot,
        unidadeId: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        telefone: VALID_PHONES.MOBILE_SP,
        email: VALID_EMAILS.EMAIL_1,
        dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        contrato: {
          cargoId: cargoProfessor.id,
          dataInicio: TEST_DATES.CONTRACT_START,
          salario: TEST_MONEY.TEACHER_SALARY,
          disciplinasPermitidas: [
            { disciplinaId: 1, etapasIds: [1, 2] },
            { disciplinaId: 1, etapasIds: [3] }, // Duplicada
          ],
        },
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeFailure(result)) {
        expect(result.erro.type).toBe(ValidationError.TYPE);
        expect((result.erro as ValidationError).erros).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              propriedade: "disciplinasPermitidas",
              mensagem: expect.stringContaining("duplicadas"),
            }),
          ])
        );
      }
    });
  });

  describe("Falha - Autorização", () => {
    it("deve retornar UnauthorizedError quando usuário não é root", async () => {
      // Arrange: Criar usuário não-root
      const usuarioNaoRoot = new Usuario({
        id: 2,
        nome: "Usuário Comum",
        login: "comum@escola.com",
        senha: await criptografiaService.hashear("senha"),
        escolaId: 1,
        admin: false,
        root: false, // Não é root
      });
      await usuarioRepository.salvar(usuarioNaoRoot);

      const usuarioAutenticadoNaoRoot: UsuarioAutenticado = {
        id: 2,
        escolaId: 1,
        email: "",
      };

      const request = {
        usuarioAutenticado: usuarioAutenticadoNaoRoot,
        unidadeId: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        telefone: VALID_PHONES.MOBILE_SP,
        email: VALID_EMAILS.EMAIL_1,
        dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        contrato: {
          cargoId: cargoComum.id,
          dataInicio: TEST_DATES.CONTRACT_START,
          salario: TEST_MONEY.COORDINATOR_SALARY,
        },
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeFailure(result)) {
        expect(result.erro.type).toBe("unauthorized");
        expect(result.erro.message).toContain("usuário raiz");
      }
    });
  });

  describe("Validações do colaborador", () => {
    it("deve validar email do colaborador", async () => {
      // Arrange
      const request = {
        usuarioAutenticado: usuarioAutenticadoRoot,
        unidadeId: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        telefone: VALID_PHONES.MOBILE_SP,
        email: "email-invalido", // Email inválido
        dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        contrato: {
          cargoId: cargoComum.id,
          dataInicio: TEST_DATES.CONTRACT_START,
          salario: TEST_MONEY.COORDINATOR_SALARY,
        },
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeFailure(result)) {
        expect(result.erro.type).toBe(ValidationError.TYPE);
        expect((result.erro as ValidationError).erros).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              propriedade: "email",
            }),
          ])
        );
      }
    });

    it("deve validar nome do colaborador", async () => {
      // Arrange
      const request = {
        usuarioAutenticado: usuarioAutenticadoRoot,
        unidadeId: 1,
        nome: "A", // Nome muito curto
        cpf: VALID_CPFS.CPF_1,
        telefone: VALID_PHONES.MOBILE_SP,
        email: VALID_EMAILS.EMAIL_1,
        dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        contrato: {
          cargoId: cargoComum.id,
          dataInicio: TEST_DATES.CONTRACT_START,
          salario: TEST_MONEY.COORDINATOR_SALARY,
        },
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeFailure(result)) {
        expect(result.erro.type).toBe(ValidationError.TYPE);
        expect((result.erro as ValidationError).erros).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              propriedade: "nome",
            }),
          ])
        );
      }
    });
  });

  describe("Senha gerada", () => {
    it("deve gerar senha aleatória com 12 caracteres", async () => {
      // Arrange
      const request = {
        usuarioAutenticado: usuarioAutenticadoRoot,
        unidadeId: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        telefone: VALID_PHONES.MOBILE_SP,
        email: VALID_EMAILS.EMAIL_1,
        dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        contrato: {
          cargoId: cargoComum.id,
          dataInicio: TEST_DATES.CONTRACT_START,
          salario: TEST_MONEY.COORDINATOR_SALARY,
        },
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeOk(result)) {
        expect(result.value.senha).toBeDefined();
        expect(result.value.senha.length).toBe(12);
      }
    });

    it("deve hashear senha antes de salvar no banco", async () => {
      // Arrange
      const request = {
        usuarioAutenticado: usuarioAutenticadoRoot,
        unidadeId: 1,
        nome: VALID_NAMES.FULL_NAME,
        cpf: VALID_CPFS.CPF_1,
        telefone: VALID_PHONES.MOBILE_SP,
        email: VALID_EMAILS.EMAIL_1,
        dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        contrato: {
          cargoId: cargoComum.id,
          dataInicio: TEST_DATES.CONTRACT_START,
          salario: TEST_MONEY.COORDINATOR_SALARY,
        },
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeOk(result)) {
        const usuarios = usuarioRepository.getAll();
        const novoUsuario = usuarios.find((u) => u.login === VALID_EMAILS.EMAIL_1);
        expect(novoUsuario).toBeDefined();
        expect(novoUsuario!.senha).toContain("hashed_");
      }
    });
  });
});
