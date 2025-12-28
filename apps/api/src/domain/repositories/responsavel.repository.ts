import { Responsavel } from "../entities/responsavel.entity.js";

export type CriarResponsavelRequest = {
  readonly nome: string;
  readonly cpf: string;
  readonly telefone: string;
  readonly email: string;
  readonly dataDeNascimento: Date;
};

export abstract class ResponsavelRepository {
  abstract obterResponsavelPorCpf(cpf: string): Promise<Responsavel | null>;
  abstract obterResponsavelPorId(id: number): Promise<Responsavel | null>;
  abstract criarResponsavel(request: CriarResponsavelRequest): Promise<Responsavel>;
}
