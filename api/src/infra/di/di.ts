import { drizzle } from "drizzle-orm/node-postgres";
import { bindingScopeValues, Container, type ServiceIdentifier } from "inversify";
import { CriptografiaService } from "../../application/interfaces/CriptografiaService.js";
import { JwtService } from "../../application/interfaces/JwtService.js";
import { UnitOfWork } from "../../application/interfaces/UnitOfWork.js";
import { AnoLetivoQueries } from "../../application/queries/AnoLetivoQueries.js";
import { BaseCurricularQueries } from "../../application/queries/BaseQueries.js";
import { CargoQueries } from "../../application/queries/CargoQueries.js";
import { ColaboradoresQueries } from "../../application/queries/ColaboradoresQueries.js";
import { DrizzleCargoQueries } from "../queries/DrizzleCargoQueries.js";
import { ModalidadesQueries } from "../../application/queries/ModalidadesQueries.js";
import { TurmaQueries } from "../../application/queries/TurmaQueries.js";
import { UnidadeEscolarQueries } from "../../application/queries/UnidadeEscolarQueries.js";
import { CadastrarAnoLetivoUseCase } from "../../application/usecases/CadastrarAnoLetivoUseCase.js";
import { CadastrarBaseUseCase } from "../../application/usecases/CadastrarBaseCurricularUseCase.js";
import { CadastrarColaboradorUseCase } from "../../application/usecases/CadastrarColaboradorUseCase.js";
import { CadastrarDisciplinaUseCase } from "../../application/usecases/CadastrarDisciplinaUseCase.js";
import { CadastarEscolaUseCase } from "../../application/usecases/CadastrarEscolaUseCase.js";
import { CadastrarTurmaUseCase } from "../../application/usecases/CadastrarTurmaUseCase.js";
import { CadastrarUsuarioUseCase } from "../../application/usecases/CadastrarUsuarioUseCase.js";
import { ListarColaboradoresUseCase } from "../../application/usecases/ListarColaboradoresUseCase.js";
import { LoginUseCase } from "../../application/usecases/LoginUseCase.js";
import { ObterMeusDadosUseCase } from "../../application/usecases/ObterMeusDadosUseCase.js";
import { AnoLetivoRepository } from "../../domain/repositories/AnoLetivoRepository.js";
import { BaseCurricularRepository } from "../../domain/repositories/BaseCurricularRepository.js";
import { ColaboradorRepository } from "../../domain/repositories/ColaboradorRepository.js";
import { EscolaRepository } from "../../domain/repositories/EscolaRepository.js";
import { TurmaRepository } from "../../domain/repositories/TurmaRepository.js";
import { UnidadeEscolarRepository } from "../../domain/repositories/UnidadeEscolaRepository.js";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository.js";
import { DrizzleAnoLetivoQueries } from "../queries/DrizzleAnoLetivoQueries.js";
import { DrizzleBaseQueries } from "../queries/DrizzleBaseQueries.js";
import { DrizzleColaboradoresQueries } from "../queries/DrizzleColaboradoresQueries.js";
import { DrizzleModalidadesQueries } from "../queries/DrizzleEtapasQueries.js";
import { DrizzleTurmaQueries } from "../queries/DrizzleTurmaQueries.js";
import { DrizzleUnidadeEscolarQueries } from "../queries/DrizzleUnidadeEscolarQueries.js";
import { DrizzleAnoLetivoRepository } from "../repositories/drizzle/DrizzleAnoLetivoRepository.js";
import { DrizzleBaseRepository } from "../repositories/drizzle/DrizzleBaseRepository.js";
import { DrizzleColaboradorRepository } from "../repositories/drizzle/DrizzleColaboradorRepository.js";
import { DrizzleEscolaRepository } from "../repositories/drizzle/DrizzleEscolaRepository.js";
import { DrizzleService } from "../repositories/drizzle/DrizzleService.js";
import { DrizzleTurmaRepository } from "../repositories/drizzle/DrizzleTurmaRepository.js";
import { DrizzleUnidadeEscolaRepository } from "../repositories/drizzle/DrizzleUnidadeEscolaRepository.js";
import { DrizzleUsuarioRepository } from "../repositories/drizzle/DrizzleUsuarioRepository.js";
import { Argon2CriptografiaService } from "../services/Argon2CriptografiaService.js";
import { FastJwtService } from "../services/FastJwtService.js";

const container = new Container({ defaultScope: bindingScopeValues.Singleton });

const DRIZZLE_IDENTIFIER: ServiceIdentifier<ReturnType<typeof drizzle>> = Symbol("drizzle");

container
  .bind(DRIZZLE_IDENTIFIER)
  .toConstantValue(drizzle({ connection: process.env.DATABASE_URL!, casing: "snake_case" }));

container
  .bind(DrizzleService)
  .toResolvedValue((db: ReturnType<typeof drizzle>) => new DrizzleService(db), [DRIZZLE_IDENTIFIER]);

container.bind(UnitOfWork).toService(DrizzleService);

container.bind(ModalidadesQueries).toResolvedValue((db) => new DrizzleModalidadesQueries(db), [DrizzleService]);

container.bind(CargoQueries).toResolvedValue((db) => new DrizzleCargoQueries(db), [DrizzleService]);

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
  .bind(CadastrarBaseUseCase)
  .toResolvedValue(
    (repo, escolaRepo, unidadeRepo) => new CadastrarBaseUseCase(escolaRepo, repo, unidadeRepo),
    [BaseCurricularRepository, EscolaRepository, UnidadeEscolarRepository]
  );

container.bind(ObterMeusDadosUseCase).toResolvedValue((repo) => new ObterMeusDadosUseCase(repo), [UsuarioRepository]);

container
  .bind(CadastrarDisciplinaUseCase)
  .toResolvedValue((repo) => new CadastrarDisciplinaUseCase(repo), [BaseCurricularRepository]);

container
  .bind(CadastarEscolaUseCase)
  .toResolvedValue(
    (usuarioRepo, repo, criptografiaService, uow) =>
      new CadastarEscolaUseCase(usuarioRepo, repo, criptografiaService, uow),
    [UsuarioRepository, EscolaRepository, CriptografiaService, UnitOfWork]
  );

container.bind(UsuarioRepository).toResolvedValue((db) => new DrizzleUsuarioRepository(db), [DrizzleService]);

container
  .bind(ColaboradorRepository)
  .toResolvedValue((db) => new DrizzleColaboradorRepository(db), [DrizzleService]);

container.bind(CriptografiaService).toConstantValue(new Argon2CriptografiaService());

container.bind(JwtService).toConstantValue(new FastJwtService(process.env.JWT_SECRET!));

container
  .bind(LoginUseCase)
  .toResolvedValue(
    (usuarioRepo, criptoService, jwtService) => new LoginUseCase(usuarioRepo, criptoService, jwtService),
    [UsuarioRepository, CriptografiaService, JwtService]
  );

container
  .bind(CadastrarUsuarioUseCase)
  .toResolvedValue(
    (usuarioRepo, escolaRepo, criptoService) => new CadastrarUsuarioUseCase(usuarioRepo, escolaRepo, criptoService),
    [UsuarioRepository, EscolaRepository, CriptografiaService]
  );

container.bind(AnoLetivoRepository).toResolvedValue((db) => new DrizzleAnoLetivoRepository(db), [DrizzleService]);

container
  .bind(CadastrarAnoLetivoUseCase)
  .toResolvedValue((anoLetivoRepo) => new CadastrarAnoLetivoUseCase(anoLetivoRepo), [AnoLetivoRepository]);

container
  .bind(CadastrarTurmaUseCase)
  .toResolvedValue(
    (anoLetivoRepo, baseRepo, turmaRepo, unidadeRepo) =>
      new CadastrarTurmaUseCase(anoLetivoRepo, baseRepo, turmaRepo, unidadeRepo),
    [AnoLetivoRepository, BaseCurricularRepository, TurmaRepository, UnidadeEscolarRepository]
  );

container
  .bind(CadastrarColaboradorUseCase)
  .toResolvedValue(
    (uow, usuarioRepo, colaboradorRepo, criptoService) =>
      new CadastrarColaboradorUseCase(uow, usuarioRepo, colaboradorRepo, criptoService),
    [UnitOfWork, UsuarioRepository, ColaboradorRepository, CriptografiaService]
  );

container
  .bind(ListarColaboradoresUseCase)
  .toResolvedValue(
    (usuarioRepo, colaboradoresQueries) => new ListarColaboradoresUseCase(usuarioRepo, colaboradoresQueries),
    [UsuarioRepository, ColaboradoresQueries]
  );

export { container };
