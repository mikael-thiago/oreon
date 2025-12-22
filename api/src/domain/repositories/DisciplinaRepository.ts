import type { Disciplina } from "../entities/Disciplina.js";

export type ObterOuCriarDisciplinaRequest = {
    readonly nome: string;
    readonly unidadeId: number;
}

export abstract class DisciplinaRepository {
    abstract obterOuCriarNaEscola(request: ObterOuCriarDisciplinaRequest): Promise<Disciplina>;
}