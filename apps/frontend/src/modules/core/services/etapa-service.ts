export interface EtapaResponse {
  readonly id: number;
  readonly nome: string;
}

export interface IEtapaService {
  obterEtapas(): Promise<EtapaResponse[]>;
  obterEtapasPorModalidade(modalidadeId: number): Promise<EtapaResponse[]>;
}

export class EtapaService implements IEtapaService {
  async obterEtapas(): Promise<EtapaResponse[]> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/etapas`, {
      credentials: "include",
    });

    return response.json();
  }

  async obterEtapasPorModalidade(
    modalidadeId: number
  ): Promise<EtapaResponse[]> {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/modalidades/${modalidadeId}/etapas`,
      {
        credentials: "include",
      }
    );

    return response.json();
  }
}

export const etapaService: IEtapaService = new EtapaService();
