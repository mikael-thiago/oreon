import { StatusMatriculaEnum } from "../../domain/enums/status-matricula.enum.js";
import { AlunoRepository } from "../../domain/repositories/aluno.repository.js";
import { MatriculaRepository } from "../../domain/repositories/matricula.repository.js";
import { TurmaRepository } from "../../domain/repositories/turma.repository.js";
import { UnitOfWork } from "../interfaces/unit-of-work.interface.js";

export type MatricularAlunoRequest = {
  readonly dataInicio: Date;
  readonly dataFim: Date;
  readonly turmaId: number;
} & (
  | { readonly alunoId: number }
  | { readonly nome: string; readonly cpf: string }
);

export class MatricularAlunoUseCase {
  private readonly alunoRepository: AlunoRepository;
  private readonly matriculaRepository: MatriculaRepository;
  private readonly turmaRepository: TurmaRepository;
  private readonly uow: UnitOfWork;

  constructor(
    alunoRepository: AlunoRepository,
    matriculaRepository: MatriculaRepository,
    turmaRepository: TurmaRepository,
    uow: UnitOfWork
  ) {
    this.alunoRepository = alunoRepository;
    this.matriculaRepository = matriculaRepository;
    this.turmaRepository = turmaRepository;
    this.uow = uow;
  }

  async execute(request: MatricularAlunoRequest) {
    return this.uow.transact(async () => {
      const aluno = await this._obterOuCriarAluno(request);
      const turma = await this.turmaRepository.obterPorId(request.turmaId);

      if (turma === null) {
        throw new Error("Turma não encontrada!");
      }

      const matriculaExistente =
        await this.matriculaRepository.obterMatriculaAlunoAnoLetivo({
          alunoId: aluno.id,
          anoLetivoId: turma.anoLetivoId,
        });

      if (matriculaExistente && matriculaExistente.estaAtiva()) {
        throw new Error("Aluno possui matrícula ativa");
      }

      const matricula = await this.matriculaRepository.criarMatricula({
        alunoId: aluno.id,
        anoLetivoId: turma.anoLetivoId,
        dataInicio: request.dataInicio,
        status: StatusMatriculaEnum.Aprovada,
        turmaId: turma.id,
      });

      return { aluno, matricula };
    });
  }

  private async _obterOuCriarAluno(request: MatricularAlunoRequest) {
    if ("alunoId" in request) {
      const aluno = await this.alunoRepository.obterAlunoPorId(request.alunoId);

      if (!aluno)
        throw new Error(`Aluno com id ${request.alunoId} não encontrado!`);

      return aluno;
    }

    return this.alunoRepository.criarAluno(request);
  }
}
