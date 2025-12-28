export type DocumentoDto = {
  readonly id: number;
  readonly url: string;
  readonly status: string;
};

export abstract class DocumentoQueries {
  abstract obterDocumentoPorId(id: number): Promise<DocumentoDto | null>;
}
