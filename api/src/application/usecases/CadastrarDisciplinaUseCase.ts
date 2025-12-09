import { Disciplina } from "../../domain/entities/Disciplina.js";
import { ForbiddenError } from "../../domain/errors/ForbiddenError.js";
import { IllegalArgumentError } from "../../domain/errors/IllegalArgumentError.js";
import { UnauthorizedError } from "../../domain/errors/UnauthorizedError.js";
import type { BaseCurricularRepository } from "../../domain/repositories/BaseCurricularRepository.js";
import type { UsuarioAutenticado } from "../types/AuthenticatedUser.js";

export type CadastrarDisciplinaRequest = {
  readonly baseId: number;
  readonly nome: string;
  readonly codigo: string;
  readonly cargaHorariaAnual: number;
  readonly usuario: UsuarioAutenticado;
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

  async executar(request: CadastrarDisciplinaRequest): Promise<CadastrarDisciplinaResponse> {
    const baseCurricular = await this.baseRepository.obterPorId(request.baseId);

    if (baseCurricular === null) {
      throw new IllegalArgumentError(`Base com ID ${request.baseId} não existe!`);
    }

    if (baseCurricular.unidadeId !== request.usuario.escolaId) {
      throw new ForbiddenError("Você não tem permissão para adicionar disciplinas a esta base curricular");
    }

    baseCurricular.adicionarDisciplina(
      new Disciplina({
        nome: request.nome,
        codigo: request.codigo,
        cargaHorariaAnual: request.cargaHorariaAnual,
      })
    );

    await this.baseRepository.salvarBaseCurricular(baseCurricular);

    const disciplinaAdicionada = baseCurricular.disciplinas.find((disciplina) => disciplina.nome === request.nome)!;

    return {
      id: disciplinaAdicionada.getId()!,
      baseId: baseCurricular.id,
      cargaHorariaAnual: disciplinaAdicionada.cargaHorariaAnual,
      codigo: disciplinaAdicionada.codigo,
      nome: disciplinaAdicionada.nome,
    };
  }
}
