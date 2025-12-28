import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ColaboradoresQueries } from "../../../application/queries/colaboradores.queries.js";
import { DisciplinaQueries } from "../../../application/queries/disciplina.queries.js";
import { UnidadeEscolarQueries } from "../../../application/queries/unidade-escolar.queries.js";
import { container } from "../../di/di.js";

export async function unidadesRoutes(fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/escolas/unidades",
    {
      onRequest: [fastify.authenticate],
    },
    async function handle(request) {
      const query = container.get(UnidadeEscolarQueries);
      return query.listarUnidades(request.user.id);
    }
  );

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/unidades/:unidadeId/disciplinas",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: z.object({
          unidadeId: z.coerce.number(),
        }),
      },
    },
    async function handle(request) {
      const disciplinaQueries = container.get(DisciplinaQueries);
      const { unidadeId } = request.params;

      return disciplinaQueries.listarDisciplinasPorUnidade(unidadeId);
    }
  );

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/unidades/:unidadeId/colaboradores/:colaboradorId",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: z.object({
          unidadeId: z.coerce.number(),
          colaboradorId: z.coerce.number(),
        }),
      },
    },
    async function handle(request) {
      const colaboradoresQueries = container.get(ColaboradoresQueries);
      const { colaboradorId } = request.params;

      return colaboradoresQueries.obterDetalhesDoColaboradorPorId(colaboradorId);
    }
  );
}
