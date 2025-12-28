export type CriarMatriculaRequest = {
  readonly cpf: string;
  readonly nome: string;
  readonly dataDeNascimento: string;
  readonly unidadeId: number;
  readonly periodoLetivoId: number;
  readonly comprovanteResidencia: File;
  readonly historicoEscolar: File;
};

export type CriarMatriculaResponse = {
  readonly id: number;
};

export type ListarMatriculasResponse = {
  readonly id: number;
  readonly estudante: {
    readonly cpf: string;
    readonly nome: string;
    readonly dataDeNascimento: string;
  };
}[];

export type SolicitarMatriculaRequest = {
  readonly relacaoResponsabilidade: string;
  readonly cpf: string;
  readonly nome: string;
  readonly dataDeNascimento: string;
  readonly sexo: string;
  readonly periodoLetivoId: number;
  readonly unidadeId: number;
  readonly etapaId: number;
  readonly responsavelNome: string;
  readonly responsavelCpf: string;
  readonly responsavelTelefone: string;
  readonly responsavelEmail: string;
  readonly responsavelDataDeNascimento: string;
  readonly comprovanteResidencia: File;
  readonly historicoEscolar: File;
  readonly documentoResponsavel: File;
  readonly documentoAluno: File;
};

export type SolicitarMatriculaResponse = {
  readonly id: number;
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
  readonly modalidade: string;
  readonly etapa: string;
  readonly status: string;
  readonly dataSolicitacao: string;
  readonly comprovanteResidenciaId: number;
  readonly historicoEscolarId: number;
  readonly downloadUrls: {
    readonly comprovanteResidencia: string;
    readonly historicoEscolar: string;
  };
}[];

export interface IMatriculaService {
  criar(data: CriarMatriculaRequest): Promise<CriarMatriculaResponse>;
  listar(unidadeId: number, periodoLetivoId: number): Promise<ListarMatriculasResponse>;
  solicitar(data: SolicitarMatriculaRequest): Promise<SolicitarMatriculaResponse>;
  listarSolicitacoes(unidadeId: number, periodoLetivoId: number): Promise<ListarSolicitacoesResponse>;
}

export class MatriculaService implements IMatriculaService {
  async criar(data: CriarMatriculaRequest): Promise<CriarMatriculaResponse> {
    const formData = new FormData();

    // Add text fields
    formData.append("cpf", data.cpf);
    formData.append("nome", data.nome);
    formData.append("dataDeNascimento", data.dataDeNascimento);
    formData.append("unidadeId", String(data.unidadeId));
    formData.append("periodoLetivoId", String(data.periodoLetivoId));

    // Add file fields
    formData.append("comprovanteResidencia", data.comprovanteResidencia);
    formData.append("historicoEscolar", data.historicoEscolar);

    const response = await fetch(`http://localhost:4000/matriculas`, {
      method: "POST",
      credentials: "include",
      body: formData,
      // CRITICAL: Do NOT set Content-Type header - browser sets it automatically with multipart boundary
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  }

  async listar(unidadeId: number, periodoLetivoId: number): Promise<ListarMatriculasResponse> {
    const response = await fetch(
      `http://localhost:4000/unidade/${unidadeId}/periodoLetivo/${periodoLetivoId}/matriculas`,
      {
        credentials: "include",
      }
    );

    return response.json();
  }

  async solicitar(data: SolicitarMatriculaRequest): Promise<SolicitarMatriculaResponse> {
    const formData = new FormData();

    console.log(data);

    formData.append("cpf", data.cpf);
    formData.append("nome", data.nome);
    formData.append("dataDeNascimento", data.dataDeNascimento);
    formData.append("periodoLetivoId", String(data.periodoLetivoId));
    formData.append("etapaId", String(data.etapaId));
    formData.append("sexo", data.sexo);
    formData.append("responsavelNome", data.responsavelNome);
    formData.append("responsavelCpf", data.responsavelCpf);
    formData.append("responsavelTelefone", data.responsavelTelefone);
    formData.append("responsavelEmail", data.responsavelEmail);
    formData.append("responsavelDataDeNascimento", data.responsavelDataDeNascimento);
    formData.append("relacaoResponsabilidade", data.relacaoResponsabilidade);
    formData.append("comprovanteResidencia", data.comprovanteResidencia);
    formData.append("historicoEscolar", data.historicoEscolar);
    formData.append("documentoResponsavel", data.documentoResponsavel);
    formData.append("documentoAluno", data.documentoAluno);

    const response = await fetch(`http://localhost:4000/unidades/${data.unidadeId}/solicitar-matricula`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  }

  async listarSolicitacoes(unidadeId: number, periodoLetivoId: number): Promise<ListarSolicitacoesResponse> {
    const response = await fetch(
      `http://localhost:4000/unidade/${unidadeId}/periodoLetivo/${periodoLetivoId}/solicitacoes`,
      {
        credentials: "include",
      }
    );

    return response.json();
  }
}

export const matriculaService: IMatriculaService = new MatriculaService();
