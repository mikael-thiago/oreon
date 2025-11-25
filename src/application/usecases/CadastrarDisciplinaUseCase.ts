import { Disciplina } from "../../domain/entities/Disciplina.js";
import { IllegalArgumentError } from "../../domain/errors/IllegalArgumentError.js";
import type { BaseCurricularRepository } from "../../domain/repositories/BaseCurricularRepository.js";

export type CadastrarDisciplinaRequest = {
  readonly baseId: number;
  readonly nome: string;
  readonly codigo: string;
  readonly cargaHorariaAnual: number;
};

export type CadastrarDisciplinaResponse = {
  readonly id: number;
  readonly baseId: number;
  readonly nome: string;
  readonly codigo: string;
  readonly cargaHorariaAnual: number;
};

export class CadastrarDisciplinaUseCase {
  constructor(private readonly baseRepository: BaseCurricularRepository) {}

  async executar(
    request: CadastrarDisciplinaRequest
  ): Promise<CadastrarDisciplinaResponse> {
    const baseCurricular = await this.baseRepository.obterPorId(request.baseId);

    if (baseCurricular === null) {
      throw new IllegalArgumentError(
        `Base com ID ${request.baseId} não existe!`
      );
    }

    baseCurricular.adicionarDisciplina(
      new Disciplina({
        nome: request.nome,
        codigo: request.codigo,
        cargaHorariaAnual: request.cargaHorariaAnual,
      })
    );

    await this.baseRepository.salvarBaseCurricular(baseCurricular);

    const disciplinaAdicionada = baseCurricular.disciplinas.find(
      (disciplina) => disciplina.nome === request.nome
    )!;

    return {
      id: disciplinaAdicionada.getId()!,
      baseId: baseCurricular.id,
      cargaHorariaAnual: disciplinaAdicionada.cargaHorariaAnual,
      codigo: disciplinaAdicionada.codigo,
      nome: disciplinaAdicionada.nome,
    };
  }
}
