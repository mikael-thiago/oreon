import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { CadastrarColaboradorUseCase } from "../../../application/usecases/cadastrar-colaborador.usecase.js";
import { ListarColaboradoresUseCase } from "../../../application/usecases/listar-colaboradores.usecase.js";
import { container } from "../../di/di.js";

const listarColaboradoresQuerySchema = z.object({
  unidadeId: z.coerce
    .number({
      error: (issue) =>
        issue.input === undefined ? "O ID da unidade deve ser um número" : "O ID da unidade deve ser um número",
    })
    .int("O ID da unidade deve ser um número inteiro")
    .positive("O ID da unidade deve ser um número positivo")
    .optional(),
});

const cadastrarColaboradorSchema = z.object({
  nome: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "O nome do colaborador é obrigatório" : "O nome do colaborador deve ser um texto",
    })
    .min(1, "O nome do colaborador é obrigatório"),
  cpf: z
    .string({
      error: (issue) => (issue.input === undefined ? "O CPF é obrigatório" : "O CPF deve ser um texto"),
    })
    .length(11, "O CPF deve ter 11 dígitos")
    .regex(/^\d{11}$/, "O CPF deve conter apenas números"),
  telefone: z
    .string({
      error: (issue) => (issue.input === undefined ? "O telefone é obrigatório" : "O telefone deve ser um texto"),
    })
    .min(1, "O telefone é obrigatório"),
  email: z
    .string({
      error: (issue) => (issue.input === undefined ? "O email é obrigatório" : "O email deve ser um texto"),
    })
    .email("O email deve ser válido"),
  unidadeId: z
    .number({
      error: (issue) =>
        issue.input === undefined ? "O ID da unidade é obrigatório" : "O ID da unidade deve ser um número",
    })
    .int("O ID da unidade deve ser um número inteiro")
    .positive("O ID da unidade deve ser um número positivo"),
  contrato: z.object({
    cargoId: z
      .number({
        error: (issue) =>
          issue.input === undefined ? "O ID do cargo é obrigatório" : "O ID do cargo deve ser um número",
      })
      .int("O ID do cargo deve ser um número inteiro")
      .positive("O ID do cargo deve ser um número positivo"),
    dataInicio: z.iso
      .date({
        error: (issue) =>
          issue.input === undefined
            ? "A data de início do contrato é obrigatória"
            : "A data de início deve estar no formato ISO 8601",
      })
      .transform((val) => new Date(val)),
    dataFim: z.iso
      .date("A data de fim deve estar no formato ISO 8601")
      .transform((val) => new Date(val))
      .optional(),
    salario: z
      .number({
        error: (issue) => (issue.input === undefined ? "O salário é obrigatório" : "O salário deve ser um número"),
      })
      .positive("O salário deve ser um número positivo"),
    disciplinasPermitidas: z
      .array(
        z.object({
          disciplinaId: z
            .number({
              error: (issue) =>
                issue.input === undefined
                  ? "O ID da disciplina é obrigatório"
                  : "O ID da disciplina deve ser um número",
            })
            .int("O ID da disciplina deve ser um número inteiro")
            .positive("O ID da disciplina deve ser um número positivo"),
          etapasIds: z
            .array(
              z
                .number({
                  error: (issue) =>
                    issue.input === undefined ? "O ID da etapa é obrigatório" : "O ID da etapa deve ser um número",
                })
                .int("O ID da etapa deve ser um número inteiro")
                .positive("O ID da etapa deve ser um número positivo")
            )
            .min(1, "Ao menos uma etapa deve ser informada"),
        })
      )
      .optional(),
  }),
});

export async function colaboradoresRoutes(fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/colaboradores",
    {
      schema: { querystring: listarColaboradoresQuerySchema },
      onRequest: [fastify.authenticate],
    },
    async function handle(request) {
      const usecase = container.get(ListarColaboradoresUseCase);

      return usecase.executar({
        usuarioAutenticado: request.user,
        unidadeId: request.query.unidadeId,
      });
    }
  );

  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/colaboradores",
    {
      schema: { body: cadastrarColaboradorSchema },
      onRequest: [fastify.authenticate],
    },
    async function handle(request) {
      const usecase = container.get(CadastrarColaboradorUseCase);

      return usecase.executar({
        usuarioAutenticado: request.user,
        nome: request.body.nome,
        cpf: request.body.cpf,
        telefone: request.body.telefone,
        email: request.body.email,
        unidadeId: request.body.unidadeId,
        contrato: request.body.contrato,
      });
    }
  );
}
