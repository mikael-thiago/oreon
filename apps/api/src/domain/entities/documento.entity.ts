import { StatusDocumentoEnum } from "../enums/status-documento.enum.js";

export type Documento = {
  readonly id: number;
} & (
  | { readonly conteudo: string; readonly status: typeof StatusDocumentoEnum.EmProcessamento }
  | { readonly url: string; readonly status: typeof StatusDocumentoEnum.Carregado }
);
