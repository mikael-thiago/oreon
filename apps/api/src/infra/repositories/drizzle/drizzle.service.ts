import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { drizzle, NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import type { PgDatabase, PgTransaction } from "drizzle-orm/pg-core";
import { AsyncLocalStorage } from "node:async_hooks";
import type { UnitOfWork } from "../../../application/interfaces/unit-of-work.interface.js";
import { Result } from "../../../domain/shared/result.js";

export class DrizzleService implements UnitOfWork {
  private readonly als = new AsyncLocalStorage<
    PgTransaction<NodePgQueryResultHKT, Record<string, unknown>, ExtractTablesWithRelations<Record<string, unknown>>>
  >();

  constructor(private readonly drizzleDb: ReturnType<typeof drizzle>) {}

  async transact<Result = unknown>(fn: () => Promise<Result>): Promise<Result> {
    if (this.als.getStore()) {
      const result = await fn();

      if (Result.isResult(result) && Result.isFailure(result)) {
        this.als.getStore()?.rollback();
      }

      return result;
    }

    return this.drizzleDb.transaction((tx) =>
      this.als.run(tx, async () => {
        const result = await fn();

        if (Result.isResult(result) && Result.isFailure(result)) {
          this.als.getStore()?.rollback();
        }

        return result;
      })
    );
  }

  getTransaction(): PgDatabase<
    NodePgQueryResultHKT,
    Record<string, unknown>,
    ExtractTablesWithRelations<Record<string, unknown>>
  > {
    return this.als.getStore() ?? this.drizzleDb;
  }
}
