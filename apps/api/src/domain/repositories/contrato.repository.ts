import type { Contrato } from "../entities/contrato.entity.js";

export abstract class ContratoRepository {
  abstract obterProximoId(): Promise<number>;
  abstract adicionar<TContrato extends Contrato>(contrato: TContrato): Promise<TContrato>;
  abstract salvar<TContrato extends Contrato>(contrato: TContrato): Promise<TContrato>;
  abstract obterContratoAtivoColaborador(colaboradorId: number): Promise<Contrato | null>;
}
