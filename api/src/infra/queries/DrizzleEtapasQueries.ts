import { eq, sql } from "drizzle-orm";
import type { drizzle } from "drizzle-orm/node-postgres";
import type {
  EtapaResponse,
  ModalidadeResponse,
  ModalidadesQueries,
} from "../../application/queries/ModalidadesQueries.js";
import { etapaTable, modalidadeTable } from "../repositories/drizzle/schema.js";
import type { DrizzleService } from "../repositories/drizzle/DrizzleService.js";

export class DrizzleModalidadesQueries implements ModalidadesQueries {
  constructor(private readonly db: DrizzleService) {}

  async obterModalidadePorId(id: number): Promise<ModalidadeResponse | null> {
    const [row] = await this.db
      .getTransaction()
      .select({
        id: modalidadeTable.id,
        nome: modalidadeTable.name,
      })
      .from(modalidadeTable)
      .where(eq(modalidadeTable.id, id));

    return row ?? null;
  }

  async obterEtapaPorId(id: number): Promise<(EtapaResponse & { readonly modalidadeId: number }) | null> {
    const [row] = await this.db
      .getTransaction()
      .select({
        id: etapaTable.id,
        numero: etapaTable.sortOrder,
        nome: etapaTable.name,
        modalidadeId: etapaTable.modalityId,
      })
      .from(etapaTable)
      .where(eq(etapaTable.id, id));

    return row ?? null;
  }

  listarEtapas(modalidadeId: number): Promise<EtapaResponse[]> {
    return this.db
      .getTransaction()
      .select({
        id: etapaTable.id,
        numero: etapaTable.sortOrder,
        nome: etapaTable.name,
      })
      .from(etapaTable)
      .innerJoin(modalidadeTable, eq(etapaTable.modalityId, modalidadeTable.id))
      .where(eq(etapaTable.modalityId, modalidadeId));
  }

  listarModalidades(): Promise<ModalidadeResponse[]> {
    return this.db
      .getTransaction()
      .select({
        id: modalidadeTable.id,
        nome: modalidadeTable.name,
      })
      .from(modalidadeTable);
  }
}
