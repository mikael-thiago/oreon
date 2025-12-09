import { BaseCurricular } from "../entities/BaseCurricular.js";
import { Disciplina } from "../entities/Disciplina.js";

export abstract class BaseCurricularRepository {
  abstract obterPorId(id: number): Promise<BaseCurricular | null>;
  abstract existe(id: number): Promise<boolean>;
  abstract criarBaseCurricular(request: {
    readonly unidadeId: number;
    readonly etapaId: number;
    readonly codigo: string;
    readonly disciplinas: Pick<Disciplina, "nome" | "codigo" | "cargaHorariaAnual">[];
  }): Promise<BaseCurricular>;
  abstract salvarBaseCurricular(base: BaseCurricular): Promise<void>;
}
