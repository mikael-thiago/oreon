import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { TurmaQueries } from "../../../application/queries/TurmaQueries.js";
import { CadastrarTurmaUseCase } from "../../../application/usecases/CadastrarTurmaUseCase.js";
import { container } from "../../di/di.js";

const listarTurmasParamsSchema = z.object({
  unidadeId: z.coerce
    .number({
      error: (issue) =>
        issue.input === undefined ? "O ID da unidade é obrigatório" : "O ID da unidade deve ser um número",
    })
    .int("O ID da unidade deve ser um número inteiro")
    .positive("O ID da unidade deve ser um número positivo"),
  anoLetivoId: z.coerce
    .number({
      error: (issue) =>
        issue.input === undefined ? "O ID do ano letivo é obrigatório" : "O ID do ano letivo deve ser um número",
    })
    .int("O ID do ano letivo deve ser um número inteiro")
    .positive("O ID do ano letivo deve ser um número positivo"),
});

const cadastrarTurmaSchema = z.object({
  anoLetivoId: z
    .number({
      error: (issue) =>
        issue.input === undefined ? "O ID do ano letivo é obrigatório" : "O ID do ano letivo deve ser um número",
    })
    .int("O ID do ano letivo deve ser um número inteiro")
    .positive("O ID do ano letivo deve ser um número positivo"),
  baseId: z
    .number({
      error: (issue) => (issue.input === undefined ? "O ID da base é obrigatório" : "O ID da base deve ser um número"),
    })
    .int("O ID da base deve ser um número inteiro")
    .positive("O ID da base deve ser um número positivo"),
  etapaId: z
    .number({
      error: (issue) =>
        issue.input === undefined ? "O ID da etapa é obrigatório" : "O ID da etapa deve ser um número",
    })
    .int("O ID da etapa deve ser um número inteiro")
    .positive("O ID da etapa deve ser um número positivo"),
  letra: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "A letra da turma é obrigatória" : "A letra da turma deve ser um texto",
    })
    .length(1, "A letra da turma deve ter exatamente 1 caractere"),
  unidadeId: z
    .number({
      error: (issue) =>
        issue.input === undefined ? "O ID da unidade é obrigatório" : "O ID da unidade deve ser um número",
    })
    .int("O ID da unidade deve ser um número inteiro")
    .positive("O ID da unidade deve ser um número positivo"),
  limiteDeAlunos: z
    .number()
    .int("A quantidade de alunos deve ser um número inteiro")
    .positive("A quantidade de alunos deve ser um número positivo")
    .default(40),
});

export async function turmasRoutes(fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/unidade/:unidadeId/anoLetivo/:anoLetivoId/turmas",
    {
      schema: { params: listarTurmasParamsSchema },
      onRequest: [fastify.authenticate],
    },
    async function handle(request) {
      const query = container.get(TurmaQueries);
      return query.listarTurmas({
        unidadeId: request.params.unidadeId,
        anoLetivoId: request.params.anoLetivoId,
      });
    }
  );

  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/turmas",
    {
      schema: { body: cadastrarTurmaSchema },
      onRequest: [fastify.authenticate],
    },
    async function handle(request, reply) {
      const usecase = container.get(CadastrarTurmaUseCase);
      const turma = await usecase.executar(request.body);
      return reply.status(201).send(turma);
    }
  );
}
