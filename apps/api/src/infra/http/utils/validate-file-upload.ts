import type { MultipartFile } from "@fastify/multipart";
import { ValidationError } from "../../../domain/errors/validation.error.js";

const DEFAULT_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFileUpload(
  file: MultipartFile,
  fieldName: string,
  allowedMimeTypes: string[] = DEFAULT_ALLOWED_MIME_TYPES
): void {
  // Validate MIME type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw ValidationError.sintatico([
      {
        propriedade: fieldName,
        mensagem: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedMimeTypes.join(", ")}`,
      },
    ]);
  }

  // Note: File size is validated by @fastify/multipart configuration
  // This is a secondary check in case configuration is not set
  if (file.file.bytesRead > MAX_FILE_SIZE) {
    throw ValidationError.sintatico([
      {
        propriedade: fieldName,
        mensagem: `Arquivo muito grande. Tamanho máximo: 10MB`,
      },
    ]);
  }
}
