import { beforeEach, describe, expect, it } from "vitest";
import { LoginUseCase } from "../../../application/usecases/login.usecase.js";
import { Usuario } from "../../../domain/entities/usuario.entity.js";
import {
  expectToBeFailure,
  expectToBeOk,
  InMemoryUsuarioRepository,
  MockCriptografiaService,
  MockJWTService,
  VALID_EMAILS,
} from "../../helpers/index.js";

const ESCOLA_ID = 1;

describe("LoginUseCase", () => {
  let useCase: LoginUseCase;
  let usuarioRepository: InMemoryUsuarioRepository;
  let criptografiaService: MockCriptografiaService;
  let jwtService: MockJWTService;

  beforeEach(() => {
    usuarioRepository = new InMemoryUsuarioRepository();
    criptografiaService = new MockCriptografiaService();
    jwtService = new MockJWTService();
    useCase = new LoginUseCase(usuarioRepository, criptografiaService, jwtService);
  });

  describe("Login bem-sucedido", () => {
    it("deve autenticar usuário com credenciais válidas e retornar token", async () => {
      // Arrange: Criar usuário com senha hasheada
      const senha = "senha123";
      const senhaHasheada = await criptografiaService.hashear(senha);

      const usuario = new Usuario({
        id: await usuarioRepository.obterProximoId(),
        nome: "João Silva",
        login: VALID_EMAILS.EMAIL_1,
        senha: senhaHasheada,
        escolaId: ESCOLA_ID,
        admin: false,
        root: false,
      });

      await usuarioRepository.salvar(usuario);

      // Act: Executar login
      const result = await useCase.executar({
        email: usuario.login,
        senha,
      });

      // Assert: Verificar sucesso
      if (expectToBeOk(result)) {
        expect(result.value.token).toBeDefined();
        expect(result.value.token).toContain("mock_token_");
        expect(result.value.usuario).toEqual({
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.login,
          escolaId: usuario.escolaId,
        });
      }
    });

    it("deve gerar token JWT com payload correto", async () => {
      // Arrange
      const senha = "minhaSenha";
      const senhaHasheada = await criptografiaService.hashear(senha);

      const usuario = new Usuario({
        id: 42,
        nome: "Maria Santos",
        login: VALID_EMAILS.EMAIL_2,
        senha: senhaHasheada,
        escolaId: 5,
        admin: true,
        root: false,
      });

      await usuarioRepository.salvar(usuario);

      // Act
      const result = await useCase.executar({
        email: VALID_EMAILS.EMAIL_2,
        senha,
      });

      // Assert
      if (expectToBeOk(result)) {
        const tokenPayload = jwtService.verify(result.value.token);
        expect(tokenPayload).toEqual({
          id: 42,
          email: VALID_EMAILS.EMAIL_2,
          escolaId: 5,
        });
      }
    });
  });

  describe("Falha de autenticação", () => {
    it("deve retornar UnauthorizedError quando email não existe", async () => {
      // Arrange: Nenhum usuário cadastrado

      // Act: Tentar login com email inexistente
      const result = await useCase.executar({
        email: "email.inexistente@example.com",
        senha: "qualquerSenha",
      });

      // Assert: Verificar erro de autorização
      if (expectToBeFailure(result)) {
        expect(result.erro.message).toBe("Email ou senha inválidos");
        expect(result.erro.type).toBe("unauthorized");
      }
    });

    it("deve retornar UnauthorizedError quando senha está incorreta", async () => {
      // Arrange: Criar usuário com senha específica
      const senhaCorreta = "senhaCorreta123";
      const senhaHasheada = await criptografiaService.hashear(senhaCorreta);

      const usuario = new Usuario({
        id: await usuarioRepository.obterProximoId(),
        nome: "Pedro Costa",
        login: VALID_EMAILS.EMAIL_3,
        senha: senhaHasheada,
        escolaId: ESCOLA_ID,
        admin: false,
        root: false,
      });

      await usuarioRepository.salvar(usuario);

      // Act: Tentar login com senha incorreta
      const result = await useCase.executar({
        email: usuario.login,
        senha: "senhaIncorreta",
      });

      // Assert: Verificar erro de autorização
      if (expectToBeFailure(result)) {
        expect(result.erro.message).toBe("Email ou senha inválidos");
        expect(result.erro.type).toBe("unauthorized");
      }
    });

    it("deve usar a mesma mensagem de erro para email inexistente e senha incorreta (segurança)", async () => {
      // Arrange: Criar usuário
      const senha = "senha123";
      const senhaHasheada = await criptografiaService.hashear(senha);

      const usuario = new Usuario({
        id: await usuarioRepository.obterProximoId(),
        nome: "Ana Lima",
        login: VALID_EMAILS.EMAIL_1,
        senha: senhaHasheada,
        escolaId: ESCOLA_ID,
        admin: false,
        root: false,
      });

      await usuarioRepository.salvar(usuario);

      // Act: Executar ambos os casos de falha
      const resultEmailInexistente = await useCase.executar({
        email: "inexistente@example.com",
        senha: "qualquerSenha",
      });

      const resultSenhaIncorreta = await useCase.executar({
        email: usuario.login,
        senha: "senhaErrada",
      });

      // Assert: Ambos devem ter a mesma mensagem
      if (expectToBeFailure(resultEmailInexistente) && expectToBeFailure(resultSenhaIncorreta)) {
        expect(resultEmailInexistente.erro.message).toBe(resultSenhaIncorreta.erro.message);
        expect(resultEmailInexistente.erro.message).toBe("Email ou senha inválidos");
      }
    });
  });

  describe("Casos especiais", () => {
    it("deve aceitar login case-insensitive para email", async () => {
      // Arrange: Criar usuário com email em minúsculas
      const senha = "senha123";
      const senhaHasheada = await criptografiaService.hashear(senha);

      const usuario = new Usuario({
        id: await usuarioRepository.obterProximoId(),
        nome: "Carlos Mendes",
        login: "carlos@example.com",
        senha: senhaHasheada,
        escolaId: ESCOLA_ID,
        admin: false,
        root: false,
      });

      await usuarioRepository.salvar(usuario);

      // Act: Fazer login com email em maiúsculas
      const result = await useCase.executar({
        email: usuario.login.toUpperCase(),
        senha,
      });

      // Assert: Deve ter sucesso
      expectToBeOk(result);
    });

    it("deve funcionar para usuários admin", async () => {
      // Arrange: Criar usuário admin
      const senha = "adminPass";
      const senhaHasheada = await criptografiaService.hashear(senha);

      const usuario = new Usuario({
        id: await usuarioRepository.obterProximoId(),
        nome: "Admin User",
        login: VALID_EMAILS.EMAIL_4,
        senha: senhaHasheada,
        escolaId: ESCOLA_ID,
        admin: true,
        root: false,
      });

      await usuarioRepository.salvar(usuario);

      // Act
      const result = await useCase.executar({
        email: usuario.login,
        senha,
      });

      // Assert
      if (expectToBeOk(result)) {
        expect(result.value.usuario.id).toBe(usuario.id);
      }
    });

    it("deve funcionar para usuários root", async () => {
      // Arrange: Criar usuário root
      const senha = "rootPass";
      const senhaHasheada = await criptografiaService.hashear(senha);

      const usuario = new Usuario({
        id: await usuarioRepository.obterProximoId(),
        nome: "Root User",
        login: VALID_EMAILS.EMAIL_5,
        senha: senhaHasheada,
        escolaId: ESCOLA_ID,
        admin: false,
        root: true,
      });

      await usuarioRepository.salvar(usuario);

      // Act
      const result = await useCase.executar({
        email: usuario.login,
        senha,
      });

      // Assert
      if (expectToBeOk(result)) {
        expect(result.value.usuario.id).toBe(usuario.id);
      }
    });
  });
});
