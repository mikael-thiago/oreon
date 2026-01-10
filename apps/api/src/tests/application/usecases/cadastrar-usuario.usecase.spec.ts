import { beforeEach, describe, expect, it } from "vitest";
import { CadastrarUsuarioUseCase } from "../../../application/usecases/cadastrar-usuario.usecase.js";
import { Escola } from "../../../domain/entities/escola.entity.js";
import { Usuario } from "../../../domain/entities/usuario.entity.js";
import {
  expectToBeFailure,
  expectToBeOk,
  InMemoryEscolaRepository,
  InMemoryUsuarioRepository,
  MockCriptografiaService,
  VALID_EMAILS,
  VALID_PHONES,
} from "../../helpers/index.js";

describe("CadastrarUsuarioUseCase", () => {
  let useCase: CadastrarUsuarioUseCase;
  let usuarioRepository: InMemoryUsuarioRepository;
  let escolaRepository: InMemoryEscolaRepository;
  let criptografiaService: MockCriptografiaService;

  beforeEach(async () => {
    usuarioRepository = new InMemoryUsuarioRepository();
    escolaRepository = new InMemoryEscolaRepository();
    criptografiaService = new MockCriptografiaService();

    useCase = new CadastrarUsuarioUseCase(usuarioRepository, escolaRepository, criptografiaService);

    const escolaId = await escolaRepository.obterProximoId();

    // Seed escola
    const escola = new Escola({
      id: escolaId,
      nome: "Escola Teste",
      email: "escola@teste.com",
      dataDeCriacao: new Date(),
      matriz: {
        id: 1,
        nome: "Escola Teste",
        email: "escola@teste.com",
        cnpj: "12.345.678/0001-90",
        telefone1: VALID_PHONES.LANDLINE_SP,
        telefone2: null,
        escolaId: escolaId,
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
    escolaRepository.seed([escola]);
  });

  describe("Sucesso - Usuário com senha hasheada", () => {
    it("deve cadastrar usuário com senha hasheada", async () => {
      // Arrange
      const request = {
        nome: "João Silva",
        login: VALID_EMAILS.EMAIL_1,
        senha: "minhaSenha123",
        escolaId: 1,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeOk(result)) {
        expect(result.value.id).toBeGreaterThan(0);
        expect(result.value.nome).toBe("João Silva");
        expect(result.value.login).toBe(VALID_EMAILS.EMAIL_1);
        expect(result.value.escolaId).toBe(1);

        // Verificar que usuário foi salvo
        const usuarios = usuarioRepository.getAll();
        expect(usuarios).toHaveLength(1);

        // Verificar que senha foi hasheada
        const usuario = usuarios[0]!;
        expect(usuario.senha).toBe("hashed_minhaSenha123");
        expect(usuario.senha).not.toBe("minhaSenha123");
      }
    });

    it("deve criar usuário não-admin e não-root por padrão", async () => {
      // Arrange
      const request = {
        nome: "Maria Santos",
        login: VALID_EMAILS.EMAIL_2,
        senha: "senha456",
        escolaId: 1,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeOk(result)) {
        const usuarios = usuarioRepository.getAll();
        const usuario = usuarios[0]!;
        expect(usuario.admin).toBe(false);
        expect(usuario.root).toBe(false);
      }
    });
  });

  describe("Falha - Email duplicado", () => {
    it("deve retornar ConflictError quando já existe usuário com o mesmo email", async () => {
      // Arrange: Criar usuário existente
      const usuarioExistente = new Usuario({
        id: 1,
        nome: "Usuário Existente",
        login: VALID_EMAILS.EMAIL_1,
        senha: "senhaHasheada",
        escolaId: 1,
        admin: false,
        root: false,
      });
      await usuarioRepository.salvar(usuarioExistente);

      const request = {
        nome: "Novo Usuário",
        login: VALID_EMAILS.EMAIL_1, // Mesmo email
        senha: "novaSenha",
        escolaId: 1,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeFailure(result)) {
        expect(result.erro.type).toBe("conflict");
        expect(result.erro.message).toContain("Já existe um usuário com este email");
      }
    });

    it("deve comparar email case-insensitive", async () => {
      // Arrange: Criar usuário com email em minúsculas
      const usuarioExistente = new Usuario({
        id: 1,
        nome: "Usuário Existente",
        login: "email@teste.com",
        senha: "senhaHasheada",
        escolaId: 1,
        admin: false,
        root: false,
      });
      await usuarioRepository.salvar(usuarioExistente);

      const request = {
        nome: "Novo Usuário",
        login: "EMAIL@TESTE.COM", // Mesmo email em maiúsculas
        senha: "novaSenha",
        escolaId: 1,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeFailure(result)) {
        expect(result.erro.type).toBe("conflict");
      }
    });
  });

  describe("Falha - Escola inexistente", () => {
    it("deve retornar IllegalArgumentError quando escola não existe", async () => {
      // Arrange
      const request = {
        nome: "João Silva",
        login: VALID_EMAILS.EMAIL_1,
        senha: "minhaSenha123",
        escolaId: 999, // Escola inexistente
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeFailure(result)) {
        expect(result.erro.type).toBe("illegal-argument");
        expect(result.erro.message).toContain("Escola com ID 999 não encontrada");
      }
    });
  });

  describe("Validações", () => {
    it("deve aceitar nome com acentos", async () => {
      // Arrange
      const request = {
        nome: "José da Conceição",
        login: VALID_EMAILS.EMAIL_1,
        senha: "senha123",
        escolaId: 1,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeOk(result)) {
        expect(result.value.nome).toBe("José da Conceição");
      }
    });

    it("deve aceitar senhas de diferentes tamanhos", async () => {
      // Arrange: Senha curta
      const request1 = {
        nome: "Usuário 1",
        login: VALID_EMAILS.EMAIL_1,
        senha: "abc123",
        escolaId: 1,
      };

      // Act
      const result1 = await useCase.executar(request1);

      // Assert
      if (expectToBeOk(result1)) {
        const usuarios = usuarioRepository.getAll();
        expect(usuarios.length).toBeGreaterThanOrEqual(1);
        expect(usuarios[0]!.senha).toBe("hashed_abc123");
      }

      // Reset
      usuarioRepository.reset();

      // Arrange: Senha longa
      const request2 = {
        nome: "Usuário 2",
        login: VALID_EMAILS.EMAIL_2,
        senha: "senhaSuper@Longa!Com#Caracteres$Especiais%2024",
        escolaId: 1,
      };

      // Act
      const result2 = await useCase.executar(request2);

      // Assert
      if (expectToBeOk(result2)) {
        const usuarios = usuarioRepository.getAll();
        expect(usuarios.length).toBeGreaterThanOrEqual(1);
        expect(usuarios[0]!.senha).toBe("hashed_senhaSuper@Longa!Com#Caracteres$Especiais%2024");
      }
    });
  });

  describe("Casos especiais", () => {
    it("deve gerar IDs sequenciais", async () => {
      // Arrange & Act: Criar múltiplos usuários
      const request1 = {
        nome: "Usuário 1",
        login: VALID_EMAILS.EMAIL_1,
        senha: "senha1",
        escolaId: 1,
      };

      const request2 = {
        nome: "Usuário 2",
        login: VALID_EMAILS.EMAIL_2,
        senha: "senha2",
        escolaId: 1,
      };

      const result1 = await useCase.executar(request1);
      const result2 = await useCase.executar(request2);

      // Assert
      if (expectToBeOk(result1) && expectToBeOk(result2)) {
        expect(result2.value.id).toBe(result1.value.id + 1);
      }
    });

    it("deve preservar campos originais do usuário", async () => {
      // Arrange
      const request = {
        nome: "João Silva",
        login: VALID_EMAILS.EMAIL_1,
        senha: "minhaSenha123",
        escolaId: 1,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeOk(result)) {
        const usuarios = usuarioRepository.getAll();

        expect(usuarios.length).toBeGreaterThanOrEqual(1);

        const usuario = usuarios[0]!;

        // Campos devem estar exatamente como informados
        expect(usuario.nome).toBe("João Silva");
        expect(usuario.login).toBe(VALID_EMAILS.EMAIL_1);
        expect(usuario.escolaId).toBe(1);
      }
    });

    it("deve retornar dados do usuário sem a senha hasheada", async () => {
      // Arrange
      const request = {
        nome: "Maria Santos",
        login: VALID_EMAILS.EMAIL_1,
        senha: "minhaSenha",
        escolaId: 1,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeOk(result)) {
        // Response não deve conter senha
        expect(result.value).not.toHaveProperty("senha");
        expect(result.value.id).toBeDefined();
        expect(result.value.nome).toBeDefined();
        expect(result.value.login).toBeDefined();
        expect(result.value.escolaId).toBeDefined();
      }
    });
  });
});
