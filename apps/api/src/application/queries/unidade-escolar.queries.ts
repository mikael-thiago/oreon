export type ListarUnidadesResponse = {
  readonly id: number;
  readonly nome: string;
  readonly cnpj: string;
  readonly telefone1: string;
  readonly telefone2: string | null;
  readonly cidade: string | null;
  readonly estado: string | null;
  readonly isMatriz: boolean;
};

export abstract class UnidadeEscolarQueries {
  abstract listarUnidades(usuarioId: number): Promise<ListarUnidadesResponse[]>;
}
