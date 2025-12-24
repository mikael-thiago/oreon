import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { BaseCurricularQueries } from "../../../application/queries/base.queries.js";
import { CadastrarBaseUseCase } from "../../../application/usecases/cadastrar-base-curricular.usecase.js";
import { container } from "../../di/di.js";

const criarBaseSchema = z.object({
  etapaId: z
    .number({
      error: (issue) =>
        issue.input === undefined ? "O ID da etapa é obrigatório" : "O ID da etapa deve ser um número",
    })
    .nonoptional("O ID da etapa é obrigatório"),
  unidadeId: z
    .number({
      error: (issue) =>
        issue.input === undefined ? "O ID da unidade é obrigatório" : "O ID da unidade deve ser um número",
    })
    .nonoptional("O ID da unidade é obrigatório"),
  disciplinas: z.array(
    z.object({
      nome: z
        .string({
          error: (issue) =>
            issue.input === undefined ? "O nome da disciplina obrigatório" : "O nome da disciplina deve ser um texto",
        })
        .nonempty("O nome da disciplina é obrigatório"),
      codigo: z.string().default(""),
      cargaHorariaAnual: z
        .number({
          error: (issue) =>
            issue.input === undefined
              ? "A carga horária anual é obrigatória"
              : "A carga horária anual deve ser um número",
        })
        .positive("A carga horária anual deve ser um número positivo"),
    })
  ),
});

const criarDisciplinaSchema = z.object({
  nome: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "O nome da disciplina é obrigatório" : "O nome da disciplina deve ser um texto",
    })
    .nonempty("O nome da disciplina é obrigatório"),
  codigo: z.string().default(""),
  cargaHorariaAnual: z
    .number({
      error: (issue) =>
        issue.input === undefined ? "A carga horária anual é obrigatória" : "A carga horária anual deve ser um número",
    })
    .positive("A carga horária anual deve ser um número positivo"),
});

export async function basesRoutes(fastify: FastifyInstance) {
  fastify
    .withTypeProvider<ZodTypeProvider>()
    .post(
      "/bases",
      { schema: { body: criarBaseSchema }, onRequest: [fastify.authenticate] },
      async function handle(request, reply) {
        const usecase = container.get(CadastrarBaseUseCase);

        return usecase.executar({
          ...request.body,
          usuario: request.user,
        });
      }
    );

  // fastify.withTypeProvider<ZodTypeProvider>().post(
  //   "/bases/:id/disciplinas",
  //   {
  //     schema: {
  //       params: z.object({
  //         id: z.coerce.number().nonoptional("O ID da base é obrigatório"),
  //       }),
  //       body: criarDisciplinaSchema,
  //     },
  //     onRequest: [fastify.authenticate],
  //   },
  //   async function handle(request) {
  //     const usecase = container.get(CadastrarDisciplinaUseCase);

  //     return usecase.executar({
  //       ...request.body,
  //       baseId: request.params.id,
  //       usuario: request.user,
  //     });
  //   }
  // );

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/unidade/:unidadeId/bases",
    {
      schema: {
        params: z.object({
          unidadeId: z.coerce.number().int().positive("O ID da unidade deve ser um número positivo"),
        }),
        querystring: z.object({
          etapaId: z.coerce.number().int().positive("O ID da etapa deve ser um número positivo").optional(),
        }),
      },
      onRequest: [fastify.authenticate],
    },
    function handle(request) {
      const query = container.get(BaseCurricularQueries);
      return query.listarBases({ unidadeId: request.params.unidadeId, etapaId: request.query.etapaId });
    }
  );

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/bases/:id",
    {
      schema: {
        params: z.object({
          id: z.coerce.number().int().positive("O ID da base deve ser um número positivo"),
        }),
      },
      onRequest: [fastify.authenticate],
    },
    async function handle(request, reply) {
      const query = container.get(BaseCurricularQueries);
      const base = await query.obterBasePorId(request.params.id);

      if (!base) {
        return reply.status(404).send({ message: "Base curricular não encontrada" });
      }

      return base;
    }
  );
}
