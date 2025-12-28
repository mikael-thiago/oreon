export interface AnoLetivoResponse {
  readonly id: number;
  readonly ano: number;
  readonly dataInicio: string;
  readonly dataFim: string;
}

export interface CadastrarAnoLetivoRequest {
  readonly anoReferencia: number;
  readonly dataInicio: string;
  readonly dataFim: string;
}

export interface IAnoLetivoService {
  obterAnosLetivos(): Promise<AnoLetivoResponse[]>;
  cadastrar(data: CadastrarAnoLetivoRequest): Promise<void>;
}

export class AnoLetivoService implements IAnoLetivoService {
  async obterAnosLetivos(): Promise<AnoLetivoResponse[]> {
    const response = await fetch(`http://localhost:4000/anos-letivos`, {
      credentials: "include",
    });

    return response.json();
  }

  async cadastrar(data: CadastrarAnoLetivoRequest): Promise<void> {
    const response = await fetch(`http://localhost:4000/anos-letivos`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        anoReferencia: data.anoReferencia,
        dataInicio: new Date(data.dataInicio).toISOString(),
        dataFim: new Date(data.dataFim).toISOString(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }
  }
}

export const anoLetivoService: IAnoLetivoService = new AnoLetivoService();
