import type { Documento } from "../entities/documento.entity.js";

export type CriarDocumentoRequest = {
  readonly conteudo: string;
};

export type AtualizarDocumentoRequest = {
  readonly id: number;
  readonly url: string;
};

export abstract class DocumentoRepository {
  abstract criarDocumento(request: CriarDocumentoRequest): Promise<Documento>;
  abstract atualizarDocumento(request: AtualizarDocumentoRequest): Promise<Documento>;
}
