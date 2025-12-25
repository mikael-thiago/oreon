export type ListarMatriculasRequest = {
  readonly unidadeId: number;
  readonly periodoLetivoId: number;
};

export type ListarMatriculasResponse = {
  readonly id: number;
  readonly estudante: {
    readonly id: number;
    readonly nome: string;
    readonly cpf: string;
    readonly dataDeNascimento: string;
  };
  readonly status: string;
  readonly dataCriacao: string;
  readonly comprovanteResidenciaId: number;
  readonly historicoEscolarId: number;
};

export abstract class MatriculasQueries {
  abstract listarMatriculas(request: ListarMatriculasRequest): Promise<ListarMatriculasResponse[]>;
}
