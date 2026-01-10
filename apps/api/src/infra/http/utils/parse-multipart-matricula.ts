import type { FastifyRequest } from "fastify";
import type { MultipartFields, UploadedFile } from "../types/multipart.types.js";
import { validateFileUpload } from "./validate-file-upload.js";

export type ParsedMatriculaData = {
  fields: MultipartFields;
  comprovanteResidencia: UploadedFile | null;
  historicoEscolar: UploadedFile | null;
};

export async function parseMultipartMatricula(request: FastifyRequest): Promise<ParsedMatriculaData> {
  const parts = request.parts();
  const fields: MultipartFields = {};
  let comprovanteResidencia: UploadedFile | null = null;
  let historicoEscolar: UploadedFile | null = null;

  for await (const part of parts) {
    if (part.type === "field") {
      fields[part.fieldname] = part.value as string;
    } else if (part.type === "file") {
      // Validate file before processing
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
      }
    }
  }

  return { fields, comprovanteResidencia, historicoEscolar };
}
