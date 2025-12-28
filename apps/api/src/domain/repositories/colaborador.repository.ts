import { Colaborador } from "../entities/colaborador.entity.js";

export type CriarColaboradorData = {
  readonly cpf: string;
  readonly email: string;
  readonly usuarioId: number;
  readonly telefone: string;

  // Contrato
  readonly cargoId: number;
  readonly unidadeId: number;
  readonly numeroMatricula?: string;
  readonly dataInicio: Date;
  readonly dataFim?: Date | null;
  readonly salario: number;
};

export type CriarProfessorRequest = CriarColaboradorData & {
  readonly disciplinasPermitidas: { readonly disciplinaId: number; readonly etapasIds: number[] }[];
};

export abstract class ColaboradorRepository {
  abstract obterColaboradorPorId(id: number): Promise<Colaborador | null>;
  abstract obterColaboradorPorCpf(cpf: string): Promise<Colaborador | null>;
  abstract obterColaboradorPorEmail(email: string): Promise<Colaborador | null>;
  abstract obterColaboradorPorUsuarioId(usuarioId: number): Promise<Colaborador | null>;
  abstract criarColaborador(data: CriarColaboradorData): Promise<Colaborador>;
  abstract criarProfessor(data: CriarProfessorRequest): Promise<Colaborador>;
}
