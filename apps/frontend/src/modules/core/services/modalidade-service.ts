export type ModalidadeResponse = {
  readonly id: number;
  readonly nome: string;
};

export type ModalidadeComMatriculaResponse = {
  readonly id: number;
  readonly nome: string;
  readonly quantidadeSolicitacoes: number;
};

export interface IModalidadeService {
  obterModalidades(): Promise<ModalidadeResponse[]>;
  obterModalidadesComMatriculas(unidadeId: number, anoLetivoId: number): Promise<ModalidadeComMatriculaResponse[]>;
}

export class ModalidadeService implements IModalidadeService {
  async obterModalidadesComMatriculas(
    unidadeId: number,
    anoLetivoId: number
  ): Promise<ModalidadeComMatriculaResponse[]> {
    const response = await fetch(
      `http://localhost:4000/unidades/${unidadeId}/ano-letivo/${anoLetivoId}/modalidades-com-matriculas`,
      {
        credentials: "include",
      }
    );

    return response.json();
  }

  async obterModalidades(): Promise<ModalidadeResponse[]> {
    const response = await fetch(`http://localhost:4000/modalidades`, {
      credentials: "include",
    });

    return response.json();
  }
}

export const modalidadeService: IModalidadeService = new ModalidadeService();
