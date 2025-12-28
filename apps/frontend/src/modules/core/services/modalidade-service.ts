export interface ModalidadeResponse {
  readonly id: number;
  readonly nome: string;
}

export interface IModalidadeService {
  obterModalidades(): Promise<ModalidadeResponse[]>;
}

export class ModalidadeService implements IModalidadeService {
  async obterModalidades(): Promise<ModalidadeResponse[]> {
    const response = await fetch(`http://localhost:4000/modalidades`, {
      credentials: "include",
    });

    return response.json();
  }
}

export const modalidadeService: IModalidadeService = new ModalidadeService();
