import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { Umzug } from "umzug";
import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

const migrationsTable = pgTable("umzug_migrations", {
  name: varchar({ length: 255 }).notNull(),
  executedAt: timestamp().notNull().defaultNow(),
});

const seedersTable = pgTable("umzug_seeders", {
  name: varchar({ length: 255 }).notNull(),
  executedAt: timestamp().notNull().defaultNow(),
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to parse SQL files with UP/DOWN sections
async function parseSqlFile(filePath: string): Promise<{ up: string; down: string }> {
  const content = await readFile(filePath, "utf-8");

  // Split by -- DOWN marker
  const downMarkerIndex = content.indexOf("-- DOWN");

  if (downMarkerIndex === -1) {
    throw new Error(`SQL file ${filePath} must contain a "-- DOWN" section`);
  }

  // Extract UP section (everything before -- DOWN, excluding -- UP if present)
  let upSection = content.substring(0, downMarkerIndex).trim();
  if (upSection.startsWith("-- UP")) {
    upSection = upSection.substring("-- UP".length).trim();
  }

  // Extract DOWN section (everything after -- DOWN)
  const downSection = content.substring(downMarkerIndex + "-- DOWN".length).trim();

  return {
    up: upSection,
    down: downSection,
  };
}

// Migration resolver for SQL files
function sqlMigrationResolver(params: { name: string; path?: string; context: any }) {
  const filePath = params.path!;

  return {
    name: params.name,
    up: async ({ context }: any) => {
      const { up: upSql } = await parseSqlFile(filePath);
      if (upSql) {
        await context.pool.query(upSql);
      }
    },
    down: async ({ context }: any) => {
      const { down: downSql } = await parseSqlFile(filePath);
      if (downSql) {
        await context.pool.query(downSql);
      }
    },
  };
}

export const db = drizzle({ connection: process.env.DATABASE_URL!, casing: "snake_case" });

// Migrations configuration
export const migrator = new Umzug({
  migrations: {
    glob: ["migrations/*.{ts,sql}", { cwd: __dirname }],
    resolve: (params) => {
      if (params.path?.endsWith('.sql')) {
        return sqlMigrationResolver(params);
      }
      // For .ts files, use default Umzug resolver
      return Umzug.defaultResolver(params);
    },
  },
  context: { db, pool },
  storage: {
    async executed({ context }) {
      await context.db.execute(sql`
        CREATE TABLE IF NOT EXISTS umzug_migrations (
          name VARCHAR(255) PRIMARY KEY,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      const result = await context.db.select({ name: migrationsTable.name }).from(migrationsTable);

      return result.map((row) => row.name);
    },
    async logMigration({ name, context }) {
      await context.db.execute(sql`INSERT INTO umzug_migrations (name) VALUES (${name})`);
    },
    async unlogMigration({ name, context }) {
      await context.db.execute(sql`DELETE FROM umzug_migrations WHERE name = ${name}`);
    },
  },
  logger: console,
});

// Seeders configuration
export const seeder = new Umzug({
  migrations: {
    glob: ["seeders/*.{ts,sql}", { cwd: __dirname }],
    resolve: (params) => {
      if (params.path?.endsWith('.sql')) {
        return sqlMigrationResolver(params);
      }
      // For .ts files, use default Umzug resolver
      return Umzug.defaultResolver(params);
    },
  },
  context: { db, pool },
  storage: {
    async executed({ context }) {
      await context.db.execute(sql`
        CREATE TABLE IF NOT EXISTS umzug_seeders (
          name VARCHAR(255) PRIMARY KEY,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      const result = await context.db.select({ name: seedersTable.name }).from(seedersTable);

      return result.map((row) => row.name);
    },
    async logMigration({ name, context }) {
      await context.db.execute(sql`INSERT INTO umzug_seeders (name) VALUES (${name})`);
    },
    async unlogMigration({ name, context }) {
      await context.db.execute(sql`DELETE FROM umzug_seeders WHERE name = ${name}`);
    },
  },
  logger: console,
});

export type Migration = typeof migrator._types.migration;
export type Seeder = typeof seeder._types.migration;
