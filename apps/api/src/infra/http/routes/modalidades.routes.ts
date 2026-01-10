import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { ModalidadesQueries } from "../../../application/queries/modalidades.queries.js";
import { container } from "../../di/di.js";

export async function modalidadesRoutes(fastify: FastifyInstance) {
  fastify.get("/modalidades", { onRequest: [fastify.authenticate] }, async function handle() {
    const query = container.get(ModalidadesQueries);
    return query.listarModalidades();
  });

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/modalidades/:id/etapas",
    {
      schema: {
        params: z.object({
          id: z.coerce.number().int().positive("O ID da modalidade deve ser um número positivo"),
        }),
      },
      onRequest: [fastify.authenticate],
    },
    async function handle(request) {
      const query = container.get(ModalidadesQueries);
      return query.listarEtapas(request.params.id);
    }
  );

  fastify.get("/etapas", { onRequest: [fastify.authenticate] }, async function handle() {
    const query = container.get(ModalidadesQueries);
    return query.listarTodasEtapas();
  });

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/unidades/:unidadeId/ano-letivo/:anoLetivoId/modalidades-com-matriculas",
    {
      schema: {
        params: z.object({
          unidadeId: z.coerce.number().int().positive("O ID da unidade deve ser um número positivo"),
          anoLetivoId: z.coerce.number().int().positive("O ID do ano letivo deve ser um número positivo"),
        }),
      },
      onRequest: [fastify.authenticate],
    },
    async function handle(request) {
      const query = container.get(ModalidadesQueries);
      return query.obterModalidadesComMatriculas(request.params.unidadeId, request.params.anoLetivoId);
    }
  );
}
