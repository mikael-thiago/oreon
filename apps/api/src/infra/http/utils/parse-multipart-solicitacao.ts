import type { FastifyRequest } from "fastify";
import type { MultipartFields, UploadedFile } from "../types/multipart.types.js";
import { validateFileUpload } from "./validate-file-upload.js";

export type ParsedSolicitacaoData = {
  fields: MultipartFields;
  comprovanteResidencia: UploadedFile | null;
  historicoEscolar: UploadedFile | null;
  documentoAluno: UploadedFile | null;
  documentoResponsavel: UploadedFile | null;
};

export async function parseMultipartSolicitacao(request: FastifyRequest): Promise<ParsedSolicitacaoData> {
  const parts = request.parts();
  const fields: MultipartFields = {};
  let comprovanteResidencia: UploadedFile | null = null;
  let historicoEscolar: UploadedFile | null = null;
  let documentoAluno: UploadedFile | null = null;
  let documentoResponsavel: UploadedFile | null = null;

  for await (const part of parts) {
    if (part.type === "field") {
      fields[part.fieldname] = part.value as string;
    } else if (part.type === "file") {
      validateFileUpload(part, part.fieldname);

      const buffer = await part.toBuffer();

      if (part.fieldname === "comprovanteResidencia") {
        comprovanteResidencia = {
          fileName: part.filename,
          content: buffer,
        };
      } else if (part.fieldname === "historicoEscolar") {
        historicoEscolar = {
          fileName: part.filename,
          content: buffer,
        };
      } else if (part.fieldname === "documentoAluno") {
        documentoAluno = {
          fileName: part.filename,
          content: buffer,
        };
      } else if (part.fieldname === "documentoResponsavel") {
        documentoResponsavel = {
          fileName: part.filename,
          content: buffer,
        };
      }
    }
  }

  return { fields, comprovanteResidencia, historicoEscolar, documentoAluno, documentoResponsavel };
}
