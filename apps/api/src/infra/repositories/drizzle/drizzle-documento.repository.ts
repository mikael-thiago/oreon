import { eq } from "drizzle-orm";
import type { Documento } from "../../../domain/entities/documento.entity.js";
import type {
  AtualizarDocumentoRequest,
  CriarDocumentoRequest,
  DocumentoRepository,
} from "../../../domain/repositories/documento.repository.js";
import { StatusDocumentoEnum } from "../../../domain/enums/status-documento.enum.js";
import type { DrizzleService } from "./drizzle.service.js";
import { documentsTable } from "./schema.js";

export class DrizzleDocumentoRepository implements DocumentoRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async criarDocumento(request: CriarDocumentoRequest): Promise<Documento> {
    const [documentoModel] = await this.drizzle
      .getTransaction()
      .insert(documentsTable)
      .values({
        url: null,
        content: request.conteudo,
        status: StatusDocumentoEnum.EmProcessamento,
      })
      .returning();

    if (!documentoModel) {
      throw new Error("Falha ao criar documento");
    }

    return {
      id: documentoModel.id,
      conteudo: documentoModel.content!,
      status: StatusDocumentoEnum.EmProcessamento,
    };
  }

  async atualizarDocumento(request: AtualizarDocumentoRequest): Promise<Documento> {
    const [documentoModel] = await this.drizzle
      .getTransaction()
      .update(documentsTable)
      .set({
        url: request.url,
        content: null,
        status: StatusDocumentoEnum.Carregado,
      })
      .where(eq(documentsTable.id, request.id))
      .returning();

    if (!documentoModel) {
      throw new Error("Falha ao atualizar documento");
    }

    return {
      id: documentoModel.id,
      url: documentoModel.url!,
      status: StatusDocumentoEnum.Carregado,
    };
  }
}
