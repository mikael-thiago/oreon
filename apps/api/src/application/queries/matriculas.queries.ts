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
  readonly downloadUrls: {
    readonly comprovanteResidencia: string;
    readonly historicoEscolar: string;
  };
};

export type ListarSolicitacoesRequest = {
  readonly unidadeId: number;
  readonly periodoLetivoId: number;
};

export type ListarSolicitacoesResponse = {
  readonly id: number;
  readonly estudante: {
    readonly id: number;
    readonly nome: string;
    readonly cpf: string;
    readonly dataDeNascimento: string;
  };
  readonly responsavel: {
    readonly id: number;
    readonly nome: string;
    readonly cpf: string;
    readonly telefone: string;
    readonly email: string;
  };
  readonly status: string;
  readonly dataSolicitacao: string;
  readonly etapa: string;
  readonly modalidade: string;
  readonly comprovanteResidenciaId: number;
  readonly historicoEscolarId: number;
  readonly downloadUrls: {
    readonly comprovanteResidencia: string;
    readonly historicoEscolar: string;
  };
};

export type ObterDetalhesSolicitacaoResponse = {
  readonly id: number;
  readonly unidadeId: number;
  readonly estudante: {
    readonly id: number;
    readonly nome: string;
    readonly cpf: string;
    readonly dataDeNascimento: string;
  };
  readonly responsavel: {
    readonly id: number;
    readonly nome: string;
    readonly cpf: string;
    readonly telefone: string;
    readonly email: string;
  };
  readonly etapa: string;
  readonly modalidade: string;
  readonly status: string;
  readonly dataSolicitacao: string;
  readonly comprovanteResidenciaId: number;
  readonly historicoEscolarId: number;
  readonly downloadUrls: {
    readonly comprovanteResidencia: string;
    readonly historicoEscolar: string;
  };
};

export abstract class MatriculasQueries {
  abstract listarMatriculas(request: ListarMatriculasRequest): Promise<ListarMatriculasResponse[]>;
  abstract listarSolicitacoes(request: ListarSolicitacoesRequest): Promise<ListarSolicitacoesResponse[]>;
  abstract obterDetalhesSolicitacao(id: number): Promise<ObterDetalhesSolicitacaoResponse | null>;
}
