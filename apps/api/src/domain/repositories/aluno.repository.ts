import { Aluno } from "../entities/aluno.entity.js";

export abstract class AlunoRepository {
  abstract obterProximoId(): Promise<number>;
  abstract obterAlunoPorCpf(cpf: string): Promise<Aluno | null>;
  abstract obterAlunoPorId(id: number): Promise<Aluno | null>;
  abstract salvar(aluno: Aluno): Promise<Aluno>;
}
