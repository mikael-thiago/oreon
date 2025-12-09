export interface AnoLetivoResponse {
  readonly id: number;
  readonly ano: number;
  readonly dataInicio: string;
  readonly dataFim: string;
}

export interface IAnoLetivoService {
  obterAnosLetivos(): Promise<AnoLetivoResponse[]>;
}

export class AnoLetivoService implements IAnoLetivoService {
  async obterAnosLetivos(): Promise<AnoLetivoResponse[]> {
    const response = await fetch(`http://localhost:4000/anos-letivos`, {
      credentials: "include",
    });

    return response.json();
  }
}

export const anoLetivoService: IAnoLetivoService = new AnoLetivoService();
