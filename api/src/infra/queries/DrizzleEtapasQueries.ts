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

  listarEtapas(modalidadeId: number): Promise<EtapaResponse[]> {
    return this.db
      .getTransaction()
      .select({
        id: etapaTable.id,
        numero: etapaTable.sortOrder,
        nome: sql<string>`${etapaTable.name} ||' do ' || ${modalidadeTable.name}`,
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
