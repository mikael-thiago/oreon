import { Aluno } from "../entities/aluno.entity.js";

export type CriarAlunoRequest = {
  readonly nome: string;
  readonly cpf: string;
  readonly dataDeNascimento: Date;
};

export abstract class AlunoRepository {
  abstract obterAlunoPorCpf(cpf: string): Promise<Aluno | null>;
  abstract obterAlunoPorId(id: number): Promise<Aluno | null>;
  abstract criarAluno(request: CriarAlunoRequest): Promise<Aluno>;
}
