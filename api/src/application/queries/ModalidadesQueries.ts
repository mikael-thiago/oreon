export type ModalidadeResponse = {
  readonly id: number;
  readonly nome: string;
};

export type EtapaResponse = {
  readonly id: number;
  readonly numero: number;
  readonly nome: string;
};

export abstract class ModalidadesQueries {
  abstract listarModalidades(): Promise<ModalidadeResponse[]>;
  abstract listarEtapas(modalidadeId: number): Promise<EtapaResponse[]>;
  abstract obterModalidadePorId(id: number): Promise<ModalidadeResponse | null>;
  abstract obterEtapaPorId(id: number): Promise<(EtapaResponse & { readonly modalidadeId: number }) | null>;
}
