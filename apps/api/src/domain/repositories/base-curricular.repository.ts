import { BaseCurricular, type DisciplinaDaBase } from "../entities/base-curricular.entity.js";
import { Disciplina } from "../entities/disciplina.entity.js";

export abstract class BaseCurricularRepository {
  abstract obterProximoId(): Promise<number>;
  abstract obterPorId(id: number): Promise<BaseCurricular | null>;
  abstract existe(id: number): Promise<boolean>;
  abstract salvar(base: BaseCurricular): Promise<BaseCurricular>;
  abstract atualizar(base: BaseCurricular): Promise<BaseCurricular>;
  abstract obterSequencialPorEtapaEUnidade(request: {
    readonly etapaId: number;
    readonly unidadeId: number;
  }): Promise<number>;
  abstract verificarExistenciaDeCodigoDeDisciplinaNaUnidade(codigo: string, unidadeId: number): Promise<boolean>;
}
