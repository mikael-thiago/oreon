import { Colaborador } from "../entities/Colaborador.js";

export type CriarColaboradorData = {
  // Employee data
  readonly cpf: string;
  readonly email: string;
  readonly usuarioId: number;

  // Contract data
  readonly cargoId: number;
  readonly unidadeId: number;
  readonly numeroMatricula?: string;
  readonly dataInicio: Date;
  readonly dataFim?: Date | null;
};

export abstract class ColaboradorRepository {
  abstract obterColaboradorPorId(id: number): Promise<Colaborador | null>;
  abstract obterColaboradorPorCpf(cpf: string): Promise<Colaborador | null>;
  abstract obterColaboradorPorEmail(email: string): Promise<Colaborador | null>;
  abstract obterColaboradorPorUsuarioId(usuarioId: number): Promise<Colaborador | null>;
  abstract criarColaborador(data: CriarColaboradorData): Promise<Colaborador>;
}
