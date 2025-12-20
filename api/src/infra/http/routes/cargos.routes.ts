import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { CargoQueries } from "../../../application/queries/CargoQueries.js";
import { container } from "../../di/di.js";

export async function cargosRoutes(fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>().get("/cargos", async function handle() {
    const cargoQueries = container.get(CargoQueries);

    return cargoQueries.listarCargos();
  });
}
