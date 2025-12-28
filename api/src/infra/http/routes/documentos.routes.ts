import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import z from "zod";
import { FileStorageService } from "../../../application/interfaces/file-storage.interface.js";
import { DocumentoQueries } from "../../../application/queries/documento.queries.js";
import { NotFoundError } from "../../../domain/errors/not-found.error.js";
import { container } from "../../di/di.js";
import { UnauthorizedError } from "../../../domain/errors/unauthorized.error.js";
import { ForbiddenError } from "../../../domain/errors/forbidden.error.js";

const downloadParamsSchema = z.object({
  id: z.coerce
    .number({
      error: (issue) =>
        issue.input === undefined ? "O ID do documento é obrigatório" : "O ID do documento deve ser um número",
    })
    .int("O ID do documento deve ser um número inteiro")
    .positive("O ID do documento deve ser um número positivo"),
});

const downloadQuerySchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
});

export async function documentosRoutes(fastify: FastifyInstance) {
  // Token-based download route (no authentication required)
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/documents/:id/download",
    {
      schema: {
        params: downloadParamsSchema,
        querystring: downloadQuerySchema,
      },
    },
    async function handle(request, reply) {
      const fileStorageService = container.get(FileStorageService);
      const documentoQueries = container.get(DocumentoQueries);

      // 1. Verify download token
      const tokenData = await fileStorageService.verifyToken(request.query.token);

      if (!tokenData) {
        throw new UnauthorizedError("Token inválido ou expirado");
      }

      // 2. Verify document ID matches token document ID
      if (tokenData.documentId !== request.params.id) {
        throw new ForbiddenError("Token inválido para este documento");
      }

      // 3. Get document from database
      const documento = await documentoQueries.obterDocumentoPorId(request.params.id);

      if (!documento) {
        throw new NotFoundError("Documento não encontrado");
      }

      if (documento.status !== "carregado") {
        throw new NotFoundError("Documento ainda está sendo processado");
      }

      // 4. Build file path and verify existence
      const filePath = `.${documento.url}`;

      try {
        await stat(filePath);
      } catch (error) {
        throw new NotFoundError("Arquivo não encontrado no sistema");
      }

      // 5. Determine MIME type
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes: Record<string, string> = {
        ".pdf": "application/pdf",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".doc": "application/msword",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      };
      const mimeType = mimeTypes[ext] || "application/octet-stream";

      // 6. Stream file to client
      const stream = createReadStream(filePath);
      return reply
        .type(mimeType)
        .header("Content-Disposition", `inline; filename="${path.basename(filePath)}"`)
        .send(stream);
    }
  );
}
