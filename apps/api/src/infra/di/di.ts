import { drizzle } from "drizzle-orm/node-postgres";
import { bindingScopeValues, Container, type ServiceIdentifier } from "inversify";
import { CriptografiaService } from "../../application/interfaces/criptografia.service.js";
import { JwtService } from "../../application/interfaces/jwt.service.js";
import { UnitOfWork } from "../../application/interfaces/unit-of-work.interface.js";
import { AnoLetivoQueries } from "../../application/queries/ano-letivo.queries.js";
import { BaseCurricularQueries } from "../../application/queries/base.queries.js";
import { CargoQueries } from "../../application/queries/cargo.queries.js";
import { ColaboradoresQueries } from "../../application/queries/colaboradores.queries.js";
import { DisciplinaQueries } from "../../application/queries/disciplina.queries.js";
import { DrizzleCargoQueries } from "../queries/drizzle-cargo.queries.js";
import { ModalidadesQueries } from "../../application/queries/modalidades.queries.js";
import { TurmaQueries } from "../../application/queries/turma.queries.js";
import { UnidadeEscolarQueries } from "../../application/queries/unidade-escolar.queries.js";
import { CadastrarAnoLetivoUseCase } from "../../application/usecases/cadastrar-ano-letivo.usecase.js";
import { CadastrarBaseUseCase } from "../../application/usecases/cadastrar-base-curricular.usecase.js";
import { CadastrarColaboradorUseCase } from "../../application/usecases/cadastrar-colaborador.usecase.js";
import { CadastarEscolaUseCase } from "../../application/usecases/cadastrar-escola.usecase.js";
import { CadastrarTurmaUseCase } from "../../application/usecases/cadastrar-turma.usecase.js";
import { CadastrarUsuarioUseCase } from "../../application/usecases/cadastrar-usuario.usecase.js";
import { ListarColaboradoresUseCase } from "../../application/usecases/listar-colaboradores.usecase.js";
import { LoginUseCase } from "../../application/usecases/login.usecase.js";
import { ObterMeusDadosUseCase } from "../../application/usecases/obter-meus-dados.usecase.js";
import { AnoLetivoRepository } from "../../domain/repositories/ano-letivo.repository.js";
import { BaseCurricularRepository } from "../../domain/repositories/base-curricular.repository.js";
import { CargoRepository } from "../../domain/repositories/cargo.repository.js";
import { ColaboradorRepository } from "../../domain/repositories/colaborador.repository.js";
import { ContratoRepository } from "../../domain/repositories/contrato.repository.js";
import { EscolaRepository } from "../../domain/repositories/escola.repository.js";
import { TurmaRepository } from "../../domain/repositories/turma.repository.js";
import { UnidadeEscolarRepository } from "../../domain/repositories/unidade-escola.repository.js";
import { UsuarioRepository } from "../../domain/repositories/usuario.repository.js";
import { DrizzleAnoLetivoQueries } from "../queries/drizzle-ano-letivo.queries.js";
import { DrizzleBaseQueries } from "../queries/drizzle-base.queries.js";
import { DrizzleColaboradoresQueries } from "../queries/drizzle-colaboradores.queries.js";
import { DrizzleDisciplinaQueries } from "../queries/drizzle-disciplina.queries.js";
import { DrizzleModalidadesQueries } from "../queries/drizzle-etapas.queries.js";
import { DrizzleTurmaQueries } from "../queries/drizzle-turma.queries.js";
import { DrizzleUnidadeEscolarQueries } from "../queries/drizzle-unidade-escolar.queries.js";
import { DrizzleAnoLetivoRepository } from "../repositories/drizzle/drizzle-ano-letivo.repository.js";
import { DrizzleBaseRepository } from "../repositories/drizzle/drizzle-base.repository.js";
import { DrizzleCargoRepository } from "../repositories/drizzle/drizzle-cargo.repository.js";
import { DrizzleColaboradorRepository } from "../repositories/drizzle/drizzle-colaborador.repository.js";
import { DrizzleContratoRepository } from "../repositories/drizzle/drizzle-contrato.repository.js";
import { DrizzleEscolaRepository } from "../repositories/drizzle/drizzle-escola.repository.js";
import { DrizzleService } from "../repositories/drizzle/drizzle.service.js";
import { DrizzleTurmaRepository } from "../repositories/drizzle/drizzle-turma.repository.js";
import { DrizzleUnidadeEscolaRepository } from "../repositories/drizzle/drizzle-unidade-escola.repository.js";
import { DrizzleUsuarioRepository } from "../repositories/drizzle/drizzle-usuario.repository.js";
import { Argon2CriptografiaService } from "../services/argon2-criptografia.service.js";
import { FastJwtService } from "../services/fast-jwt.service.js";
import { DisciplinaRepository } from "../../domain/repositories/disciplina.repository.js";
import { DrizzleDisciplinaRepository } from "../repositories/drizzle/drizzle-disciplina.repository.js";
import { AlunoRepository } from "../../domain/repositories/aluno.repository.js";
import { MatriculaRepository } from "../../domain/repositories/matricula.repository.js";
import { DocumentoRepository } from "../../domain/repositories/documento.repository.js";
import { DrizzleAlunoRepository } from "../repositories/drizzle/drizzle-aluno.repository.js";
import { DrizzleMatriculaRepository } from "../repositories/drizzle/drizzle-matricula.repository.js";
import { DrizzleDocumentoRepository } from "../repositories/drizzle/drizzle-documento.repository.js";
import { FileStorageService } from "../../application/interfaces/file-storage.interface.js";
import { LocalFileStorageService } from "../services/local-file-storage.service.js";
import { MatriculasQueries } from "../../application/queries/matriculas.queries.js";
import { DrizzleMatriculasQueries } from "../queries/drizzle-matriculas.queries.js";
import { CriarMatriculaUseCase } from "../../application/usecases/criar-matricula.usecase.js";
import { SolicitarMatriculaUseCase } from "../../application/usecases/solicitar-matricula.usecase.js";
import { ResponsavelRepository } from "../../domain/repositories/responsavel.repository.js";
import { SolicitacaoMatriculaRepository } from "../../domain/repositories/solicitacao-matricula.repository.js";
import { DrizzleResponsavelRepository } from "../repositories/drizzle/drizzle-responsavel.repository.js";
import { DrizzleSolicitacaoMatriculaRepository } from "../repositories/drizzle/drizzle-solicitacao-matricula.repository.js";
import { DocumentoQueries } from "../../application/queries/documento.queries.js";
import { DrizzleDocumentoQueries } from "../queries/drizzle-documento.queries.js";
import { ListarSolicitacoesUseCase } from "../../application/usecases/listar-solicitacoes.usecase.js";
import { ListarResumoSolicitacoesUseCase } from "../../application/usecases/listar-resumo-solicitacoes.usecase.js";
import { ObterDetalhesSolicitacaoUseCase } from "../../application/usecases/obter-detalhes-solicitacao.usecase.js";

const container = new Container({ defaultScope: bindingScopeValues.Singleton });

const DRIZZLE_IDENTIFIER: ServiceIdentifier<ReturnType<typeof drizzle>> = Symbol("drizzle");

container.bind(DRIZZLE_IDENTIFIER).toConstantValue(
  drizzle({
    connection: process.env.DATABASE_URL!,
    casing: "snake_case",
    logger: {
      logQuery(query, params) {
        console.log(query, params);
      },
    },
  })
);

container
  .bind(DrizzleService)
  .toResolvedValue((db: ReturnType<typeof drizzle>) => new DrizzleService(db), [DRIZZLE_IDENTIFIER]);

container.bind(UnitOfWork).toService(DrizzleService);

container.bind(ModalidadesQueries).toResolvedValue((db) => new DrizzleModalidadesQueries(db), [DrizzleService]);

container.bind(CargoQueries).toResolvedValue((db) => new DrizzleCargoQueries(db), [DrizzleService]);

container.bind(DisciplinaQueries).toResolvedValue((db) => new DrizzleDisciplinaQueries(db), [DrizzleService]);

container.bind(BaseCurricularQueries).toResolvedValue((db) => new DrizzleBaseQueries(db), [DrizzleService]);

container.bind(AnoLetivoQueries).toResolvedValue((db) => new DrizzleAnoLetivoQueries(db), [DrizzleService]);

container.bind(TurmaQueries).toResolvedValue((db: DrizzleService) => new DrizzleTurmaQueries(db), [DrizzleService]);

container
  .bind(UnidadeEscolarQueries)
  .toResolvedValue((db: DrizzleService) => new DrizzleUnidadeEscolarQueries(db), [DrizzleService]);

container
  .bind(ColaboradoresQueries)
  .toResolvedValue((db: DrizzleService) => new DrizzleColaboradoresQueries(db), [DrizzleService]);

container
  .bind(BaseCurricularRepository)
  .toResolvedValue((drizzleService: DrizzleService) => new DrizzleBaseRepository(drizzleService), [DrizzleService]);

container
  .bind(EscolaRepository)
  .toResolvedValue((db: DrizzleService) => new DrizzleEscolaRepository(db), [DrizzleService]);

container
  .bind(UnidadeEscolarRepository)
  .toResolvedValue((db: DrizzleService) => new DrizzleUnidadeEscolaRepository(db), [DrizzleService]);

container
  .bind(TurmaRepository)
  .toResolvedValue((db: DrizzleService) => new DrizzleTurmaRepository(db), [DrizzleService]);

container
  .bind(DisciplinaRepository)
  .toResolvedValue((db: DrizzleService) => new DrizzleDisciplinaRepository(db), [DrizzleService]);

container
  .bind(CargoRepository)
  .toResolvedValue((db: DrizzleService) => new DrizzleCargoRepository(db), [DrizzleService]);

container
  .bind(CadastrarBaseUseCase)
  .toResolvedValue(
    (repo, escolaRepo, unidadeRepo, disciplinaRepository, unitOfWork, modalidadesQueries) =>
      new CadastrarBaseUseCase(escolaRepo, repo, unidadeRepo, disciplinaRepository, modalidadesQueries, unitOfWork),
    [
      BaseCurricularRepository,
      EscolaRepository,
      UnidadeEscolarRepository,
      DisciplinaRepository,
      UnitOfWork,
      ModalidadesQueries,
    ]
  )
  .inTransientScope();

container
  .bind(ObterMeusDadosUseCase)
  .toResolvedValue((repo) => new ObterMeusDadosUseCase(repo), [UsuarioRepository])
  .inTransientScope();

container
  .bind(CadastarEscolaUseCase)
  .toResolvedValue(
    (usuarioRepo, repo, criptografiaService, uow) =>
      new CadastarEscolaUseCase(usuarioRepo, repo, criptografiaService, uow),
    [UsuarioRepository, EscolaRepository, CriptografiaService, UnitOfWork]
  )
  .inTransientScope();

container.bind(UsuarioRepository).toResolvedValue((db) => new DrizzleUsuarioRepository(db), [DrizzleService]);

container.bind(ColaboradorRepository).toResolvedValue((db) => new DrizzleColaboradorRepository(db), [DrizzleService]);

container.bind(ContratoRepository).toResolvedValue((db) => new DrizzleContratoRepository(db), [DrizzleService]);

container.bind(CriptografiaService).toConstantValue(new Argon2CriptografiaService());

container.bind(JwtService).toConstantValue(new FastJwtService(process.env.JWT_SECRET!));

container
  .bind(LoginUseCase)
  .toResolvedValue(
    (usuarioRepo, criptoService, jwtService) => new LoginUseCase(usuarioRepo, criptoService, jwtService),
    [UsuarioRepository, CriptografiaService, JwtService]
  )
  .inTransientScope();

container
  .bind(CadastrarUsuarioUseCase)
  .toResolvedValue(
    (usuarioRepo, escolaRepo, criptoService) => new CadastrarUsuarioUseCase(usuarioRepo, escolaRepo, criptoService),
    [UsuarioRepository, EscolaRepository, CriptografiaService]
  )
  .inTransientScope();

container.bind(AnoLetivoRepository).toResolvedValue((db) => new DrizzleAnoLetivoRepository(db), [DrizzleService]);

container
  .bind(CadastrarAnoLetivoUseCase)
  .toResolvedValue((anoLetivoRepo) => new CadastrarAnoLetivoUseCase(anoLetivoRepo), [AnoLetivoRepository])
  .inTransientScope();

container
  .bind(CadastrarTurmaUseCase)
  .toResolvedValue(
    (anoLetivoRepo, baseRepo, turmaRepo, unidadeRepo) =>
      new CadastrarTurmaUseCase(anoLetivoRepo, baseRepo, turmaRepo, unidadeRepo),
    [AnoLetivoRepository, BaseCurricularRepository, TurmaRepository, UnidadeEscolarRepository]
  )
  .inTransientScope();

container
  .bind(CadastrarColaboradorUseCase)
  .toResolvedValue(
    (uow, usuarioRepo, colaboradorRepo, criptoService, cargoRepository, contratoRepository) =>
      new CadastrarColaboradorUseCase(
        uow,
        usuarioRepo,
        colaboradorRepo,
        contratoRepository,
        cargoRepository,
        criptoService
      ),
    [UnitOfWork, UsuarioRepository, ColaboradorRepository, CriptografiaService, CargoRepository, ContratoRepository]
  )
  .inTransientScope();

container
  .bind(ListarColaboradoresUseCase)
  .toResolvedValue(
    (usuarioRepo, colaboradoresQueries) => new ListarColaboradoresUseCase(usuarioRepo, colaboradoresQueries),
    [UsuarioRepository, ColaboradoresQueries]
  )
  .inTransientScope();

container.bind(AlunoRepository).toResolvedValue((db) => new DrizzleAlunoRepository(db), [DrizzleService]);

container.bind(MatriculaRepository).toResolvedValue((db) => new DrizzleMatriculaRepository(db), [DrizzleService]);

container.bind(DocumentoRepository).toResolvedValue((db) => new DrizzleDocumentoRepository(db), [DrizzleService]);

container
  .bind(FileStorageService)
  .toConstantValue(new LocalFileStorageService("./uploads", process.env.DOWNLOAD_TOKEN_SECRET!, process.env.BASE_URL!));

container
  .bind(MatriculasQueries)
  .toResolvedValue(
    (db, fileStorageService) => new DrizzleMatriculasQueries(db, fileStorageService),
    [DrizzleService, FileStorageService]
  );

container.bind(DocumentoQueries).toResolvedValue((db) => new DrizzleDocumentoQueries(db), [DrizzleService]);

container
  .bind(CriarMatriculaUseCase)
  .toResolvedValue(
    (alunoRepo, unidadeRepo, anoLetivoRepo, matriculaRepo, documentoRepo, fileStorage, uow) =>
      new CriarMatriculaUseCase(alunoRepo, unidadeRepo, anoLetivoRepo, matriculaRepo, documentoRepo, fileStorage, uow),
    [
      AlunoRepository,
      UnidadeEscolarRepository,
      AnoLetivoRepository,
      MatriculaRepository,
      DocumentoRepository,
      FileStorageService,
      UnitOfWork,
    ]
  )
  .inTransientScope();

container.bind(ResponsavelRepository).toResolvedValue((db) => new DrizzleResponsavelRepository(db), [DrizzleService]);

container
  .bind(SolicitacaoMatriculaRepository)
  .toResolvedValue((db) => new DrizzleSolicitacaoMatriculaRepository(db), [DrizzleService]);

container
  .bind(SolicitarMatriculaUseCase)
  .toResolvedValue(
    (alunoRepo, responsavelRepo, unidadeRepo, anoLetivoRepo, solicitacaoRepo, documentoRepo, fileStorage, uow) =>
      new SolicitarMatriculaUseCase(
        alunoRepo,
        responsavelRepo,
        unidadeRepo,
        anoLetivoRepo,
        solicitacaoRepo,
        documentoRepo,
        fileStorage,
        uow
      ),
    [
      AlunoRepository,
      ResponsavelRepository,
      UnidadeEscolarRepository,
      AnoLetivoRepository,
      SolicitacaoMatriculaRepository,
      DocumentoRepository,
      FileStorageService,
      UnitOfWork,
    ]
  )
  .inTransientScope();

container
  .bind(ListarSolicitacoesUseCase)
  .toResolvedValue(
    (unidadeRepo, matriculasQueries) => new ListarSolicitacoesUseCase(unidadeRepo, matriculasQueries),
    [UnidadeEscolarRepository, MatriculasQueries]
  )
  .inTransientScope();

container
  .bind(ObterDetalhesSolicitacaoUseCase)
  .toResolvedValue(
    (solicitacaoRepo, unidadeRepo, matriculasQueries) =>
      new ObterDetalhesSolicitacaoUseCase(solicitacaoRepo, unidadeRepo, matriculasQueries),
    [SolicitacaoMatriculaRepository, UnidadeEscolarRepository, MatriculasQueries]
  )
  .inTransientScope();

container
  .bind(ListarResumoSolicitacoesUseCase)
  .toResolvedValue(
    (unidadeRepo, matriculasQueries) => new ListarResumoSolicitacoesUseCase(unidadeRepo, matriculasQueries),
    [UnidadeEscolarRepository, MatriculasQueries]
  )
  .inTransientScope();

export { container };
