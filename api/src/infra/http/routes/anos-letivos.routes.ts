import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { AnoLetivoQueries } from "../../../application/queries/AnoLetivoQueries.js";
import { CadastrarAnoLetivoUseCase } from "../../../application/usecases/CadastrarAnoLetivoUseCase.js";
import { container } from "../../di/di.js";

const cadastrarAnoLetivoSchema = z.object({
  anoReferencia: z
    .number({
      error: (issue) =>
        issue.input === undefined ? "O ano de referência é obrigatório" : "O ano de referência deve ser um número",
    })
    .int("O ano de referência deve ser um número inteiro")
    .min(1900, "O ano de referência deve ser maior ou igual a 1900")
    .max(2100, "O ano de referência deve ser menor ou igual a 2100"),
  dataInicio: z.coerce.date({
    error: (issue) => {
      if (issue.code === "invalid_type") {
        return { message: "Data de início inválida" };
      }
      return { message: "A data de início é obrigatória" };
    },
  }),
  dataFim: z.coerce.date({
    error: (issue) => {
      if (issue.code === "invalid_type") {
        return { message: "Data de fim inválida" };
      }
      return { message: "A data de fim é obrigatória" };
    },
  }),
});

export async function anosLetivosRoutes(fastify: FastifyInstance) {
  fastify.get("/anos-letivos", { onRequest: [fastify.authenticate] }, async function handle(request) {
    const query = container.get(AnoLetivoQueries);
    return query.listarAnosLetivos(request.user.escolaId);
  });

  fastify
    .withTypeProvider<ZodTypeProvider>()
    .post(
      "/anos-letivos",
      { schema: { body: cadastrarAnoLetivoSchema }, onRequest: [fastify.authenticate] },
      async function handle(request, reply) {
        const usecase = container.get(CadastrarAnoLetivoUseCase);
        const anoLetivo = await usecase.executar({
          ...request.body,
          usuario: request.user,
        });
        reply.status(201).send(anoLetivo);
      }
    );
}
