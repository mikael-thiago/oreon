import { Responsavel } from "../entities/responsavel.entity.js";

export abstract class ResponsavelRepository {
  abstract obterProximoId(): Promise<number>;
  abstract obterResponsavelPorCpf(cpf: string): Promise<Responsavel | null>;
  abstract obterResponsavelPorId(id: number): Promise<Responsavel | null>;
  abstract salvar(responsavel: Responsavel): Promise<Responsavel>;
}
