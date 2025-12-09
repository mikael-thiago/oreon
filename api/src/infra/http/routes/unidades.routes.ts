import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { UnidadeEscolarQueries } from "../../../application/queries/UnidadeEscolarQueries.js";
import { container } from "../../di/di.js";

export async function unidadesRoutes(fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/escolas/unidades",
    {
      onRequest: [fastify.authenticate],
    },
    async function handle(request) {
      const query = container.get(UnidadeEscolarQueries);
      return query.listarUnidades(request.user.escolaId);
    }
  );
}
