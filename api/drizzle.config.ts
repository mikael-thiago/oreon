// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/infra/repositories/drizzle/schema.ts",
  casing: "snake_case",
});
