import { drizzle } from "drizzle-orm/node-postgres";
import {
  bindingScopeValues,
  Container,
  type ServiceIdentifier,
} from "inversify";
import { BaseCurricularQueries } from "../../application/queries/BaseQueries.js";
import { ModalidadesQueries } from "../../application/queries/ModalidadesQueries.js";
import { CadastrarBaseUseCase } from "../../application/usecases/CadastrarBaseCurricularUseCase.js";
import { CadastrarDisciplinaUseCase } from "../../application/usecases/CadastrarDisciplinaUseCase.js";
import { CadastarEscolaUseCase } from "../../application/usecases/CadastrarEscolaUseCase.js";
import { CadastrarUsuarioUseCase } from "../../application/usecases/CadastrarUsuarioUseCase.js";
import { LoginUseCase } from "../../application/usecases/LoginUseCase.js";
import { BaseCurricularRepository } from "../../domain/repositories/BaseCurricularRepository.js";
import { EscolaRepository } from "../../domain/repositories/EscolaRepository.js";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository.js";
import { DrizzleBaseQueries } from "../queries/DrizzleBaseQueries.js";
import { DrizzleModalidadesQueries } from "../queries/DrizzleEtapasQueries.js";
import { DrizzleBaseRepository } from "../repositories/drizzle/DrizzleBaseRepository.js";
import { DrizzleEscolaRepository } from "../repositories/drizzle/DrizzleEscolaRepository.js";
import { DrizzleUsuarioRepository } from "../repositories/drizzle/DrizzleUsuarioRepository.js";
import { Uow } from "../../application/interfaces/uow.js";
import { DrizzleService } from "../repositories/drizzle/DrizzleService.js";
import { CriptografiaService } from "../../application/interfaces/CriptografiaService.js";
import { JwtService } from "../../application/interfaces/JwtService.js";
import { Argon2CriptografiaService } from "../services/Argon2CriptografiaService.js";
import { FastJwtService } from "../services/FastJwtService.js";

const container = new Container({ defaultScope: bindingScopeValues.Singleton });

const DRIZZLE_IDENTIFIER: ServiceIdentifier<ReturnType<typeof drizzle>> =
  Symbol("drizzle");

container
  .bind(DRIZZLE_IDENTIFIER)
  .toConstantValue(
    drizzle({ connection: process.env.DATABASE_URL!, casing: "snake_case" })
  );

container
  .bind(DrizzleService)
  .toResolvedValue(
    (db: ReturnType<typeof drizzle>) => new DrizzleService(db),
    [DRIZZLE_IDENTIFIER]
  );

container.bind(Uow).toService(DrizzleService);

container
  .bind(ModalidadesQueries)
  .toResolvedValue(
    (db: ReturnType<typeof drizzle>) => new DrizzleModalidadesQueries(db),
    [DRIZZLE_IDENTIFIER]
  );

container
  .bind(BaseCurricularQueries)
  .toResolvedValue(
    (db: ReturnType<typeof drizzle>) => new DrizzleBaseQueries(db),
    [DRIZZLE_IDENTIFIER]
  );

container
  .bind(BaseCurricularRepository)
  .toResolvedValue(
    (drizzleService: DrizzleService) => new DrizzleBaseRepository(drizzleService),
    [DrizzleService]
  );

container
  .bind(EscolaRepository)
  .toResolvedValue(
    (db: ReturnType<typeof drizzle>) => new DrizzleEscolaRepository(db),
    [DRIZZLE_IDENTIFIER]
  );

container
  .bind(CadastrarBaseUseCase)
  .toResolvedValue(
    (repo, escolaRepo) => new CadastrarBaseUseCase(escolaRepo, repo),
    [BaseCurricularRepository, EscolaRepository]
  );

container
  .bind(CadastrarDisciplinaUseCase)
  .toResolvedValue(
    (repo) => new CadastrarDisciplinaUseCase(repo),
    [BaseCurricularRepository]
  );

container
  .bind(CadastarEscolaUseCase)
  .toResolvedValue(
    (repo: EscolaRepository) => new CadastarEscolaUseCase(repo),
    [EscolaRepository]
  );

container
  .bind(UsuarioRepository)
  .toResolvedValue(
    (db: ReturnType<typeof drizzle>) => new DrizzleUsuarioRepository(db),
    [DRIZZLE_IDENTIFIER]
  );

container
  .bind(CriptografiaService)
  .toConstantValue(new Argon2CriptografiaService());

container
  .bind(JwtService)
  .toConstantValue(new FastJwtService(process.env.JWT_SECRET!));

container
  .bind(LoginUseCase)
  .toResolvedValue(
    (usuarioRepo, criptoService, jwtService) =>
      new LoginUseCase(usuarioRepo, criptoService, jwtService),
    [UsuarioRepository, CriptografiaService, JwtService]
  );

container
  .bind(CadastrarUsuarioUseCase)
  .toResolvedValue(
    (usuarioRepo, escolaRepo, criptoService) =>
      new CadastrarUsuarioUseCase(usuarioRepo, escolaRepo, criptoService),
    [UsuarioRepository, EscolaRepository, CriptografiaService]
  );

export { container };
