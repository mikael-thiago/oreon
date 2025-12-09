import { Aluno } from "../entities/Aluno.js";

export type CriarAlunoRequest = {
  readonly nome: string;
  readonly cpf: string;
};

export abstract class AlunoRepository {
  abstract obterAlunoPorCpf(cpf: string): Promise<Aluno | null>;
  abstract obterAlunoPorId(id: number): Promise<Aluno | null>;
  abstract criarAluno(request: CriarAlunoRequest): Promise<Aluno>;
}
