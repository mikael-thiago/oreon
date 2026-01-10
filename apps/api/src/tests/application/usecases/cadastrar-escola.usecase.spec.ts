import { beforeEach, describe, expect, it } from "vitest";
import type { UsuarioAutenticado } from "../../../application/types/authenticated-user.type.js";
import { CadastarEscolaUseCase } from "../../../application/usecases/cadastrar-escola.usecase.js";
import { Escola } from "../../../domain/entities/escola.entity.js";
import { Usuario } from "../../../domain/entities/usuario.entity.js";
import {
  expectToBeFailure,
  expectToBeOk,
  InMemoryEscolaRepository,
  InMemoryUsuarioRepository,
  MockCriptografiaService,
  MockUnitOfWork,
  VALID_EMAILS,
  VALID_PHONES,
} from "../../helpers/index.js";

describe("CadastarEscolaUseCase", () => {
  let useCase: CadastarEscolaUseCase;
  let usuarioRepository: InMemoryUsuarioRepository;
  let escolaRepository: InMemoryEscolaRepository;
  let criptografiaService: MockCriptografiaService;
  let uow: MockUnitOfWork;

  let usuarioAdmin: Usuario;

  beforeEach(async () => {
    usuarioRepository = new InMemoryUsuarioRepository();
    escolaRepository = new InMemoryEscolaRepository();
    criptografiaService = new MockCriptografiaService();
    uow = new MockUnitOfWork();

    useCase = new CadastarEscolaUseCase(usuarioRepository, escolaRepository, criptografiaService, uow);

    // Seed usuário admin
    usuarioAdmin = new Usuario({
      id: await usuarioRepository.obterProximoId(),
      nome: "Admin Sistema",
      login: "admin@sistema.com",
      senha: await criptografiaService.hashear("senha"),
      escolaId: 0, // Admin não pertence a uma escola específica
      admin: true,
      root: false,
    });

    await usuarioRepository.salvar(usuarioAdmin);
  });

  describe("Sucesso - Escola com usuário root", () => {
    it("deve cadastrar escola com usuário root e retornar senha", async () => {
      // Arrange
      const usuarioAutenticado: UsuarioAutenticado = {
        id: usuarioAdmin.id,
        escolaId: usuarioAdmin.escolaId,
        email: usuarioAdmin.login,
      };

      const request = {
        usuarioAutenticado,
        escola: {
          nome: "Escola Teste",
          email: VALID_EMAILS.EMAIL_1,
          cnpjMatriz: "12.345.678/0001-90",
          telefone1: VALID_PHONES.LANDLINE_SP,
          telefone2: VALID_PHONES.MOBILE_SP,
          endereco: {
            rua: "Rua Teste",
            number: "123",
            city: "São Paulo",
            state: "SP",
            zipCode: "01234-567",
            country: "Brasil",
          },
        },
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeOk(result)) {
        expect(result.value.escola.id).toBeGreaterThan(0);
        expect(result.value.escola.nome).toBe("Escola Teste");
        expect(result.value.escola.matriz.email).toBe(VALID_EMAILS.EMAIL_1);
        expect(result.value.escola.matriz.cnpj).toBe("12.345.678/0001-90");
        expect(result.value.escola.matriz.telefone1).toBe(VALID_PHONES.LANDLINE_SP);
        expect(result.value.escola.matriz.telefone2).toBe(VALID_PHONES.MOBILE_SP);
        expect(result.value.escola.matriz.endereco.rua).toBe("Rua Teste");

        // Verificar usuário root criado
        expect(result.value.usuario.id).toBeGreaterThan(0);
        expect(result.value.usuario.email).toBe(VALID_EMAILS.EMAIL_1);
        expect(result.value.usuario.senha).toBeDefined();
        expect(result.value.usuario.senha.length).toBe(12);

        // Verificar que escola foi salva
        const escolas = escolaRepository.getAll();
        expect(escolas).toHaveLength(1);
        expect(escolas[0]!.email).toBe(VALID_EMAILS.EMAIL_1);

        // Verificar que usuário root foi criado
        const usuarios = usuarioRepository.getAll();
        expect(usuarios).toHaveLength(2); // Admin + root escola
        const usuarioRoot = usuarios.find((u) => u.login === VALID_EMAILS.EMAIL_1);
        expect(usuarioRoot).toBeDefined();
        expect(usuarioRoot!.root).toBe(true);
        expect(usuarioRoot!.admin).toBe(false);
        expect(usuarioRoot!.escolaId).toBe(result.value.escola.id);
      }
    });

    it("deve aceitar escola sem endereço completo", async () => {
      // Arrange
      const usuarioAutenticado: UsuarioAutenticado = {
        id: usuarioAdmin.id,
        escolaId: usuarioAdmin.escolaId,
        email: usuarioAdmin.login,
      };

      const request = {
        usuarioAutenticado,
        escola: {
          nome: "Escola Simples",
          email: VALID_EMAILS.EMAIL_2,
          cnpjMatriz: "98.765.432/0001-10",
          telefone1: VALID_PHONES.LANDLINE_RJ,
          // Sem telefone2 e sem endereco
        },
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeOk(result)) {
        expect(result.value.escola.matriz.telefone2).toBeNull();
        expect(result.value.escola.matriz.endereco.rua).toBeNull();
        expect(result.value.escola.matriz.endereco.numero).toBeNull();
      }
    });
  });

  describe("Falha - Email duplicado", () => {
    it("deve retornar ConflictError quando já existe escola com o mesmo email", async () => {
      // Arrange: Criar escola existente
      const escolaExistente = new Escola({
        id: 1,
        nome: "Escola Existente",
        email: VALID_EMAILS.EMAIL_1,
        dataDeCriacao: new Date(),
        matriz: {
          id: 1,
          nome: "Escola Existente",
          email: VALID_EMAILS.EMAIL_1,
          cnpj: "11.111.111/0001-11",
          telefone1: VALID_PHONES.LANDLINE_SP,
          telefone2: null,
          escolaId: 1,
          endereco: {
            rua: null,
            numero: null,
            cidade: null,
            estado: null,
            cep: null,
            pais: null,
          },
          dataDeCriacao: new Date(),
        },
      });
      await escolaRepository.salvar(escolaExistente);

      const usuarioAutenticado: UsuarioAutenticado = {
        id: usuarioAdmin.id,
        escolaId: usuarioAdmin.escolaId,
        email: usuarioAdmin.login,
      };

      const request = {
        usuarioAutenticado,
        escola: {
          nome: "Nova Escola",
          email: VALID_EMAILS.EMAIL_1, // Mesmo email
          cnpjMatriz: "12.345.678/0001-90",
          telefone1: VALID_PHONES.LANDLINE_SP,
        },
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeFailure(result)) {
        expect(result.erro.type).toBe("conflict");
        expect(result.erro.message).toContain("Já existe uma escola cadastrada com o email");
      }
    });
  });

  describe("Falha - Usuário não é admin", () => {
    it("deve retornar ForbiddenError quando usuário não é admin", async () => {
      // Arrange: Criar usuário não-admin
      const usuarioNaoAdmin = new Usuario({
        id: 2,
        nome: "Usuário Comum",
        login: "comum@escola.com",
        senha: await criptografiaService.hashear("senha"),
        escolaId: 1,
        admin: false, // Não é admin
        root: false,
      });
      await usuarioRepository.salvar(usuarioNaoAdmin);

      const usuarioAutenticado: UsuarioAutenticado = {
        id: 2,
        escolaId: 1,
        email: "",
      };

      const request = {
        usuarioAutenticado,
        escola: {
          nome: "Escola Teste",
          email: VALID_EMAILS.EMAIL_1,
          cnpjMatriz: "12.345.678/0001-90",
          telefone1: VALID_PHONES.LANDLINE_SP,
        },
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeFailure(result)) {
        expect(result.erro.type).toBe("forbidden");
        expect(result.erro.message).toContain("permitida apenas para usuários admin");
      }
    });
  });

  describe("Casos especiais", () => {
    it("deve usar o mesmo ID para escola e matriz", async () => {
      // Arrange
      const usuarioAutenticado: UsuarioAutenticado = {
        id: usuarioAdmin.id,
        escolaId: usuarioAdmin.escolaId,
        email: usuarioAdmin.login,
      };

      const request = {
        usuarioAutenticado,
        escola: {
          nome: "Escola Teste",
          email: VALID_EMAILS.EMAIL_1,
          cnpjMatriz: "12.345.678/0001-90",
          telefone1: VALID_PHONES.LANDLINE_SP,
        },
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeOk(result)) {
        const escolas = escolaRepository.getAll();
        expect(escolas).toHaveLength(1);
        expect(escolas[0]!.id).toBe(escolas[0]!.matriz.id);
      }
    });

    it("deve criar escola com data de criação atual", async () => {
      // Arrange
      const usuarioAutenticado: UsuarioAutenticado = {
        id: usuarioAdmin.id,
        escolaId: usuarioAdmin.escolaId,
        email: usuarioAdmin.login,
      };

      const antes = new Date();

      const request = {
        usuarioAutenticado,
        escola: {
          nome: "Escola Teste",
          email: VALID_EMAILS.EMAIL_1,
          cnpjMatriz: "12.345.678/0001-90",
          telefone1: VALID_PHONES.LANDLINE_SP,
        },
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeOk(result)) {
        const depois = new Date();
        const dataCriacao = result.value.escola.matriz.dataDeCriacao;

        expect(dataCriacao.getTime()).toBeGreaterThanOrEqual(antes.getTime());
        expect(dataCriacao.getTime()).toBeLessThanOrEqual(depois.getTime());
      }
    });

    it("deve hashear senha do usuário root antes de salvar", async () => {
      // Arrange
      const usuarioAutenticado: UsuarioAutenticado = {
        id: usuarioAdmin.id,
        escolaId: usuarioAdmin.escolaId,
        email: usuarioAdmin.login,
      };

      const request = {
        usuarioAutenticado,
        escola: {
          nome: "Escola Teste",
          email: VALID_EMAILS.EMAIL_1,
          cnpjMatriz: "12.345.678/0001-90",
          telefone1: VALID_PHONES.LANDLINE_SP,
        },
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeOk(result)) {
        const usuarios = usuarioRepository.getAll();
        const usuarioRoot = usuarios.find((u) => u.login === VALID_EMAILS.EMAIL_1);
        expect(usuarioRoot).toBeDefined();
        expect(usuarioRoot!.senha).toContain("hashed_");
        expect(usuarioRoot!.senha).not.toBe(result.value.usuario.senha); // Senha não hasheada na resposta
      }
    });

    it("deve gerar senha aleatória com 12 caracteres", async () => {
      // Arrange
      const usuarioAutenticado: UsuarioAutenticado = {
        id: usuarioAdmin.id,
        escolaId: usuarioAdmin.escolaId,
        email: usuarioAdmin.login,
      };

      const request = {
        usuarioAutenticado,
        escola: {
          nome: "Escola Teste",
          email: VALID_EMAILS.EMAIL_1,
          cnpjMatriz: "12.345.678/0001-90",
          telefone1: VALID_PHONES.LANDLINE_SP,
        },
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeOk(result)) {
        expect(result.value.usuario.senha.length).toBe(12);
      }
    });
  });
});
