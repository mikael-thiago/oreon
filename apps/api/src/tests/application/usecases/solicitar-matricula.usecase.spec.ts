import { describe, it, expect, beforeEach } from "vitest";
import {
  SolicitarMatriculaUseCase,
  type SolicitarMatriculaRequest,
} from "../../../application/usecases/solicitar-matricula.usecase.js";
import { UnidadeEscolar } from "../../../domain/entities/unidade-escolar.entity.js";
import { AnoLetivo } from "../../../domain/entities/ano-letivo.entity.js";
import { SexoEnum } from "../../../domain/enums/sexo.enum.js";
import { RelacaoResponsabilidadeEnum } from "../../../domain/enums/relacao-responsabilidade.enum.js";
import {
  expectToBeOk,
  expectToBeFailure,
  InMemoryAlunoRepository,
  InMemoryResponsavelRepository,
  InMemoryUnidadeEscolarRepository,
  InMemoryAnoLetivoRepository,
  InMemorySolicitacaoMatriculaRepository,
  InMemoryDocumentoRepository,
  MockFileStorageService,
  MockUnitOfWork,
  ResponsavelBuilder,
  VALID_CPFS,
  INVALID_CPFS,
  VALID_NAMES,
  VALID_EMAILS,
  VALID_PHONES,
  TEST_DATES,
} from "../../helpers/index.js";
import type { UsuarioAutenticado } from "../../../application/types/authenticated-user.type.js";
import { ValidationError } from "../../../domain/errors/validation.error.js";
import { Aluno } from "../../../domain/entities/aluno.entity.js";
import { ConflictError } from "../../../domain/errors/conflict.error.js";

describe("SolicitarMatriculaUseCase", () => {
  let useCase: SolicitarMatriculaUseCase;
  let alunoRepository: InMemoryAlunoRepository;
  let responsavelRepository: InMemoryResponsavelRepository;
  let unidadeEscolarRepository: InMemoryUnidadeEscolarRepository;
  let anoLetivoRepository: InMemoryAnoLetivoRepository;
  let solicitacaoMatriculaRepository: InMemorySolicitacaoMatriculaRepository;
  let documentoRepository: InMemoryDocumentoRepository;
  let fileStorageService: MockFileStorageService;
  let uow: MockUnitOfWork;

  const usuarioAutenticado: UsuarioAutenticado = {
    id: 1,
    escolaId: 1,
    email: "usuario@mail.com",
  };

  const comprovanteResidencia = {
    fileName: "comprovante.pdf",
    content: Buffer.from("comprovante de residência"),
  };

  const historicoEscolar = {
    fileName: "historico.pdf",
    content: Buffer.from("histórico escolar"),
  };

  const documentoAluno = {
    fileName: "doc_aluno.pdf",
    content: Buffer.from("documento do aluno"),
  };

  const documentoResponsavel = {
    fileName: "doc_responsavel.pdf",
    content: Buffer.from("documento do responsável"),
  };

  beforeEach(async () => {
    alunoRepository = new InMemoryAlunoRepository();
    responsavelRepository = new InMemoryResponsavelRepository();
    unidadeEscolarRepository = new InMemoryUnidadeEscolarRepository();
    anoLetivoRepository = new InMemoryAnoLetivoRepository();
    solicitacaoMatriculaRepository = new InMemorySolicitacaoMatriculaRepository();
    documentoRepository = new InMemoryDocumentoRepository();
    fileStorageService = new MockFileStorageService();
    uow = new MockUnitOfWork();

    useCase = new SolicitarMatriculaUseCase(
      alunoRepository,
      responsavelRepository,
      unidadeEscolarRepository,
      anoLetivoRepository,
      solicitacaoMatriculaRepository,
      documentoRepository,
      fileStorageService,
      uow
    );

    // Seed unidade escolar
    const unidade = new UnidadeEscolar({
      id: await unidadeEscolarRepository.obterProximoId(),
      nome: "Unidade Centro",
      email: "centro@escola.com",
      cnpj: "12.345.678/0001-90",
      telefone1: VALID_PHONES.LANDLINE_SP,
      escolaId: usuarioAutenticado.escolaId,
      dataDeCriacao: new Date(),
    });
    unidadeEscolarRepository.seed([unidade]);

    // Seed ano letivo
    const anoLetivo = new AnoLetivo({
      id: await anoLetivoRepository.obterProximoId(),
      anoReferencia: new Date().getFullYear(),
      dataInicio: TEST_DATES.SCHOOL_YEAR_START,
      dataFim: TEST_DATES.SCHOOL_YEAR_END,
      escolaId: usuarioAutenticado.escolaId,
    });
    anoLetivoRepository.seed([anoLetivo]);
  });

  describe("Sucesso - Novo aluno e novo responsável", () => {
    it("deve criar solicitação de matrícula com novo aluno e novo responsável", async () => {
      // Arrange: Dados válidos para novo aluno e responsável
      const request: SolicitarMatriculaRequest = {
        usuarioAutenticado,
        cpf: VALID_CPFS.CPF_1,
        nome: VALID_NAMES.FULL_NAME,
        sexo: SexoEnum.Feminino,
        dataDeNascimento: TEST_DATES.STUDENT_AGE_10,
        unidadeId: 1,
        periodoLetivoId: 1,
        etapaId: 1,
        relacaoResponsabilidade: RelacaoResponsabilidadeEnum.Mae,
        observacoes: "Primeira matrícula",
        responsavel: {
          nome: VALID_NAMES.SIMPLE,
          cpf: VALID_CPFS.CPF_2,
          telefone: VALID_PHONES.MOBILE_SP,
          email: VALID_EMAILS.EMAIL_1,
          dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        },
        comprovanteResidencia,
        historicoEscolar,
        documentoAluno,
        documentoResponsavel,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert: Sucesso
      if (expectToBeOk(result)) {
        expect(result.value).toBeGreaterThan(0);

        // Verificar que aluno foi criado
        const alunos = alunoRepository.getAll();
        expect(alunos).toHaveLength(1);
        expect(alunos[0]!.cpfFormatado).toBe(VALID_CPFS.CPF_1);

        // Verificar que responsável foi criado
        const responsaveis = responsavelRepository.getAll();
        expect(responsaveis).toHaveLength(1);
        expect(responsaveis[0]!.cpfFormatado).toBe(VALID_CPFS.CPF_2);

        // Verificar que solicitação foi criada
        const solicitacoes = solicitacaoMatriculaRepository.getAll();
        expect(solicitacoes).toHaveLength(1);
        expect(solicitacoes[0]!.estudanteId).toBe(alunos[0]!.id);
        expect(solicitacoes[0]!.responsavelId).toBe(responsaveis[0]!.id);
        expect(solicitacoes[0]!.observacoes).toBe("Primeira matrícula");

        // Verificar que documentos foram criados
        const documentos = documentoRepository.getAll();
        expect(documentos).toHaveLength(4); // comprovante, histórico, doc aluno, doc responsável
      }
    });
  });

  describe("Sucesso - Aluno existente", () => {
    it("deve criar solicitação reutilizando aluno existente pelo CPF", async () => {
      // Arrange: Criar aluno existente
      const alunoExistenteResult = Aluno.criar({
        id: await alunoRepository.obterProximoId(),
        cpf: VALID_CPFS.CPF_1,
        nome: "Nome Anterior",
        escolaId: usuarioAutenticado.escolaId,
        dataDeNascimento: TEST_DATES.STUDENT_AGE_15,
        sexo: SexoEnum.Masculino,
      });

      if (!expectToBeOk(alunoExistenteResult)) return;

      const alunoExistente = alunoExistenteResult.value;

      await alunoRepository.salvar(alunoExistente);

      const request = {
        usuarioAutenticado,
        cpf: alunoExistente.cpfValor, // Mesmo CPF
        nome: "Nome Novo", // Nome diferente (deve ser ignorado)
        sexo: SexoEnum.Masculino,
        dataDeNascimento: alunoExistente.dataDeNascimento,
        unidadeId: 1,
        periodoLetivoId: 1,
        etapaId: 1,
        relacaoResponsabilidade: RelacaoResponsabilidadeEnum.Pai,
        responsavel: {
          nome: VALID_NAMES.SIMPLE,
          cpf: VALID_CPFS.CPF_2,
          telefone: VALID_PHONES.MOBILE_SP,
          email: VALID_EMAILS.EMAIL_1,
          dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        },
        comprovanteResidencia,
        historicoEscolar,
        documentoAluno,
        documentoResponsavel,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeOk(result)) {
        // Deve ter apenas 1 aluno (reutilizado)
        const alunos = alunoRepository.getAll();
        expect(alunos).toHaveLength(1);
        expect(alunos[0]!.id).toBe(alunoExistente.id);
        expect(alunos[0]!.nomeCompleto).toBe(alunoExistente.nomeCompleto); // Nome não deve ser atualizado
      }
    });
  });

  describe("Sucesso - Responsável existente", () => {
    it("deve criar solicitação reutilizando responsável existente pelo CPF", async () => {
      // Arrange: Criar responsável existente
      const responsavelExistente = new ResponsavelBuilder()
        .withCpf(VALID_CPFS.CPF_2)
        .withNome("Responsável Existente")
        .withEscolaId(usuarioAutenticado.escolaId)
        .buildValid();
      await responsavelRepository.salvar(responsavelExistente);

      const request = {
        usuarioAutenticado,
        cpf: VALID_CPFS.CPF_1,
        nome: VALID_NAMES.FULL_NAME,
        sexo: SexoEnum.Feminino,
        dataDeNascimento: TEST_DATES.STUDENT_AGE_10,
        unidadeId: 1,
        periodoLetivoId: 1,
        etapaId: 1,
        relacaoResponsabilidade: RelacaoResponsabilidadeEnum.Mae,
        responsavel: {
          nome: "Nome Diferente",
          cpf: VALID_CPFS.CPF_2, // Mesmo CPF
          telefone: VALID_PHONES.MOBILE_RJ,
          email: VALID_EMAILS.EMAIL_2,
          dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_25,
        },
        comprovanteResidencia,
        historicoEscolar,
        documentoAluno,
        documentoResponsavel,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeOk(result)) {
        // Deve ter apenas 1 responsável (reutilizado)
        const responsaveis = responsavelRepository.getAll();
        expect(responsaveis).toHaveLength(1);
        expect(responsaveis[0]!.id).toBe(responsavelExistente.id);
        expect(responsaveis[0]!.nomeCompleto).toBe("Responsável Existente"); // Nome não deve ser atualizado
      }
    });
  });

  describe("Falha - CPF inválido", () => {
    it("deve retornar ValidationError quando CPF do aluno é inválido", async () => {
      // Arrange
      const request = {
        usuarioAutenticado,
        cpf: INVALID_CPFS.INVALID_CHECKSUM,
        nome: VALID_NAMES.FULL_NAME,
        sexo: SexoEnum.Feminino,
        dataDeNascimento: TEST_DATES.STUDENT_AGE_10,
        unidadeId: 1,
        periodoLetivoId: 1,
        etapaId: 1,
        relacaoResponsabilidade: RelacaoResponsabilidadeEnum.Mae,
        responsavel: {
          nome: VALID_NAMES.SIMPLE,
          cpf: VALID_CPFS.CPF_2,
          telefone: VALID_PHONES.MOBILE_SP,
          email: VALID_EMAILS.EMAIL_1,
          dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        },
        comprovanteResidencia,
        historicoEscolar,
        documentoAluno,
        documentoResponsavel,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (!expectToBeFailure(result)) return;

      expect(result.erro).toBeInstanceOf(ValidationError);
      expect((result.erro as ValidationError).erros).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            propriedade: "cpf",
          }),
        ])
      );
    });

    it("deve retornar ValidationError quando CPF do responsável é inválido", async () => {
      // Arrange
      const request = {
        usuarioAutenticado,
        cpf: VALID_CPFS.CPF_1,
        nome: VALID_NAMES.FULL_NAME,
        sexo: SexoEnum.Feminino,
        dataDeNascimento: TEST_DATES.STUDENT_AGE_10,
        unidadeId: 1,
        periodoLetivoId: 1,
        etapaId: 1,
        relacaoResponsabilidade: RelacaoResponsabilidadeEnum.Mae,
        responsavel: {
          nome: VALID_NAMES.SIMPLE,
          cpf: INVALID_CPFS.INVALID_CHECKSUM,
          telefone: VALID_PHONES.MOBILE_SP,
          email: VALID_EMAILS.EMAIL_1,
          dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        },
        comprovanteResidencia,
        historicoEscolar,
        documentoAluno,
        documentoResponsavel,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeFailure(result)) {
        expect((result.erro as ValidationError).erros).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              propriedade: "responsavel.cpf",
            }),
          ])
        );
      }
    });

    it("deve retornar ValidationError com ambos os CPFs quando ambos são inválidos", async () => {
      // Arrange
      const request = {
        usuarioAutenticado,
        cpf: INVALID_CPFS.INVALID_CHECKSUM,
        nome: VALID_NAMES.FULL_NAME,
        sexo: SexoEnum.Feminino,
        dataDeNascimento: TEST_DATES.STUDENT_AGE_10,
        unidadeId: 1,
        periodoLetivoId: 1,
        etapaId: 1,
        relacaoResponsabilidade: RelacaoResponsabilidadeEnum.Mae,
        responsavel: {
          nome: VALID_NAMES.SIMPLE,
          cpf: INVALID_CPFS.ALL_SAME_DIGITS,
          telefone: VALID_PHONES.MOBILE_SP,
          email: VALID_EMAILS.EMAIL_1,
          dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        },
        comprovanteResidencia,
        historicoEscolar,
        documentoAluno,
        documentoResponsavel,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeFailure(result)) {
        expect((result.erro as ValidationError).erros).toHaveLength(2);
        expect((result.erro as ValidationError).erros).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ propriedade: "cpf" }),
            expect.objectContaining({ propriedade: "responsavel.cpf" }),
          ])
        );
      }
    });
  });

  describe("Falha - Unidade ou período inexistente", () => {
    it("deve retornar ValidationError quando unidade escolar não existe", async () => {
      // Arrange
      const request = {
        usuarioAutenticado,
        cpf: VALID_CPFS.CPF_1,
        nome: VALID_NAMES.FULL_NAME,
        sexo: SexoEnum.Feminino,
        dataDeNascimento: TEST_DATES.STUDENT_AGE_10,
        unidadeId: 999, // Unidade inexistente
        periodoLetivoId: 1,
        etapaId: 1,
        relacaoResponsabilidade: RelacaoResponsabilidadeEnum.Mae,
        responsavel: {
          nome: VALID_NAMES.SIMPLE,
          cpf: VALID_CPFS.CPF_2,
          telefone: VALID_PHONES.MOBILE_SP,
          email: VALID_EMAILS.EMAIL_1,
          dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        },
        comprovanteResidencia,
        historicoEscolar,
        documentoAluno,
        documentoResponsavel,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeFailure(result)) {
        expect((result.erro as ValidationError).erros).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              propriedade: "unidadeId",
              mensagem: expect.stringContaining("não existe"),
            }),
          ])
        );
      }
    });

    it("deve retornar ValidationError quando período letivo não existe", async () => {
      // Arrange
      const request = {
        usuarioAutenticado,
        cpf: VALID_CPFS.CPF_1,
        nome: VALID_NAMES.FULL_NAME,
        sexo: SexoEnum.Feminino,
        dataDeNascimento: TEST_DATES.STUDENT_AGE_10,
        unidadeId: 1,
        periodoLetivoId: 999, // Período inexistente
        etapaId: 1,
        relacaoResponsabilidade: RelacaoResponsabilidadeEnum.Mae,
        responsavel: {
          nome: VALID_NAMES.SIMPLE,
          cpf: VALID_CPFS.CPF_2,
          telefone: VALID_PHONES.MOBILE_SP,
          email: VALID_EMAILS.EMAIL_1,
          dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        },
        comprovanteResidencia,
        historicoEscolar,
        documentoAluno,
        documentoResponsavel,
      };

      // Act
      const result = await useCase.executar(request);

      // Assert
      if (expectToBeFailure(result)) {
        expect((result.erro as ValidationError).erros).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              propriedade: "periodoLetivoId",
              mensagem: expect.stringContaining("não existe"),
            }),
          ])
        );
      }
    });
  });

  describe("Falha - Solicitação duplicada", () => {
    it("deve retornar ConflictError quando já existe solicitação para o aluno no período", async () => {
      // Arrange: Criar primeira solicitação
      const request = {
        usuarioAutenticado,
        cpf: VALID_CPFS.CPF_1,
        nome: VALID_NAMES.FULL_NAME,
        sexo: SexoEnum.Feminino,
        dataDeNascimento: TEST_DATES.STUDENT_AGE_10,
        unidadeId: 1,
        periodoLetivoId: 1,
        etapaId: 1,
        relacaoResponsabilidade: RelacaoResponsabilidadeEnum.Mae,
        responsavel: {
          nome: VALID_NAMES.SIMPLE,
          cpf: VALID_CPFS.CPF_2,
          telefone: VALID_PHONES.MOBILE_SP,
          email: VALID_EMAILS.EMAIL_1,
          dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
        },
        comprovanteResidencia,
        historicoEscolar,
        documentoAluno,
        documentoResponsavel,
      };

      // Criar primeira solicitação
      const firstResult = await useCase.executar(request);
      expectToBeOk(firstResult);

      // Act: Tentar criar segunda solicitação para o mesmo aluno no mesmo período
      const secondResult = await useCase.executar(request);

      // Assert
      if (expectToBeFailure(secondResult)) {
        expect(secondResult.erro).toBeInstanceOf(ConflictError);
        expect(secondResult.erro.message).toContain("Já existe uma solicitação de matrícula");
      }
    });
  });
});
