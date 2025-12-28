import { eq } from "drizzle-orm";
import type { DocumentoQueries, DocumentoDto } from "../../application/queries/documento.queries.js";
import type { DrizzleService } from "../repositories/drizzle/drizzle.service.js";
import { documentsTable } from "../repositories/drizzle/schema.js";

export class DrizzleDocumentoQueries implements DocumentoQueries {
  constructor(private readonly drizzleDb: DrizzleService) {}

  async obterDocumentoPorId(id: number): Promise<DocumentoDto | null> {
    const [doc] = await this.drizzleDb
      .getTransaction()
      .select({ id: documentsTable.id, url: documentsTable.url, status: documentsTable.status })
      .from(documentsTable)
      .where(eq(documentsTable.id, id));

    if (!doc || !doc.url) {
      return null;
    }

    return {
      id: doc.id,
      url: doc.url,
      status: doc.status ?? "",
    };
  }
}
