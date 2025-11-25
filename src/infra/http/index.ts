import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import "./types.js";
import { BaseCurricularQueries } from "../../application/queries/BaseQueries.js";
import { ModalidadesQueries } from "../../application/queries/ModalidadesQueries.js";
import { CadastrarBaseUseCase } from "../../application/usecases/CadastrarBaseCurricularUseCase.js";
import { CadastrarDisciplinaUseCase } from "../../application/usecases/CadastrarDisciplinaUseCase.js";
import { CadastarEscolaUseCase } from "../../application/usecases/CadastrarEscolaUseCase.js";
import { CadastrarUsuarioUseCase } from "../../application/usecases/CadastrarUsuarioUseCase.js";
import { LoginUseCase } from "../../application/usecases/LoginUseCase.js";
import { container } from "../di/di.js";
import { handleError } from "./handleError.js";

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET!,
});

async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
}

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);
fastify.setErrorHandler(handleError);

fastify.get("/", async function handle(_, reply) {
  reply.status(200).send("Ok");
});

fastify.get("/me", { onRequest: [authenticate] }, async function handle(request, reply) {
  // request.user está disponível e tipado após autenticação
  return {
    id: request.user.id,
    email: request.user.email,
    escolaId: request.user.escolaId,
  };
});

const loginSchema = z.object({
  email: z
    .email({
      error: (issue) => (issue.input === undefined ? "Email não informado" : "O email informado é inválido"),
    })
    .nonempty("Email não informado"),
  senha: z.string({
    error: (issue) => (issue.input === undefined ? "Senha não informada" : ""),
  }),
});

fastify
  .withTypeProvider<ZodTypeProvider>()
  .post("/login", { schema: { body: loginSchema } }, async function handle(request, reply) {
    const usecase = container.get(LoginUseCase);
    return usecase.executar(request.body);
  });

const cadastrarUsuarioSchema = z.object({
  nome: z
    .string({
      error: (issue) => (issue.input === undefined ? "O nome é obrigatório" : "O nome deve ser um texto"),
    })
    .min(1, "O nome é obrigatório"),
  email: z
    .string({
      error: (issue) => (issue.input === undefined ? "O email é obrigatório" : "O email deve ser um texto"),
    })
    .email("O email deve ser válido")
    .min(1, "O email é obrigatório"),
  senha: z
    .string({
      error: (issue) => (issue.input === undefined ? "A senha é obrigatória" : "A senha deve ser um texto"),
    })
    .min(6, "A senha deve ter no mínimo 6 caracteres"),
  telefone: z.string().optional(),
  escolaId: z
    .number({
      error: (issue) =>
        issue.input === undefined ? "O ID da escola é obrigatório" : "O ID da escola deve ser um número",
    })
    .nonoptional("O ID da escola é obrigatório"),
});

fastify
  .withTypeProvider<ZodTypeProvider>()
  .post("/usuarios", { schema: { body: cadastrarUsuarioSchema } }, async function handle(request, reply) {
    const usecase = container.get(CadastrarUsuarioUseCase);
    const usuario = await usecase.executar(request.body);
    reply.status(201).send(usuario);
  });

fastify.get("/modalidades", { onRequest: [authenticate] }, async function handle() {
  const query = container.get(ModalidadesQueries);

  return query.listarModalidades();
});

fastify.get<{ Params: { id: string } }>(
  "/modalidades/:id/etapas",
  { onRequest: [authenticate] },
  async function handle(request) {
    const query = container.get(ModalidadesQueries);

    return query.listarEtapas(Number(request.params.id));
  }
);

const criarBaseSchema = z.object({
  etapaId: z
    .number({
      error: (issue) =>
        issue.input === undefined ? "O ID da etapa é obrigatório" : "O ID da etapa deve ser um número",
    })
    .nonoptional("O ID da etapa é obrigatório"),
  escolaId: z
    .number({
      error: (issue) =>
        issue.input === undefined ? "O ID da escola é obrigatório" : "O ID da escola deve ser um número",
    })
    .nonoptional("O ID da escola é obrigatório!"),
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

fastify
  .withTypeProvider<ZodTypeProvider>()
  .post(
    "/bases",
    { schema: { body: criarBaseSchema }, onRequest: [authenticate] },
    async function handle(request, reply) {
      const usecase = container.get(CadastrarBaseUseCase);

      return usecase.executar({
        ...request.body,
        usuario: request.user,
      });
    }
  );

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

fastify.withTypeProvider<ZodTypeProvider>().post(
  "/bases/:id/disciplinas",
  {
    schema: {
      params: z.object({
        id: z.coerce.number().nonoptional("O ID da base é obrigatório"),
      }),
      body: criarDisciplinaSchema,
    },
    onRequest: [authenticate],
  },
  async function handle(request) {
    const usecase = container.get(CadastrarDisciplinaUseCase);

    return usecase.executar({ ...request.body, baseId: request.params.id });
  }
);

fastify.get("/bases", { onRequest: [authenticate] }, function handle() {
  const query = container.get(BaseCurricularQueries);
  return query.listarBases();
});

const cadastrarEscolaSchema = z.object({
  nome: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "O nome da escola é obrigatório" : "O nome da escola deve ser um texto",
    })
    .min(1, "O nome da escola é obrigatório"),
  email: z
    .email({
      error: (issue) => (issue.input === undefined ? "O email é obrigatório" : "O email deve ser válido"),
    })
    .min(1, "O email é obrigatório")
    .nonempty("O email é obrigatório"),
  telefone1: z
    .string({
      error: (issue) => (issue.input === undefined ? "O telefone 1 é obrigatório" : "O telefone 1 deve ser um texto"),
    })
    .min(1, "O telefone 1 é obrigatório"),
  telefone2: z.string({ message: "O telefone 2 deve ser um texto" }).optional(),
  endereco: z
    .object({
      rua: z.string({ message: "A rua deve ser um texto" }).optional(),
      numero: z.string({ message: "O número deve ser um texto" }).optional(),
      cidade: z.string({ message: "A cidade deve ser um texto" }).optional(),
      estado: z
        .string({ message: "O estado deve ser um texto" })
        .length(2, "O estado deve ter 2 caracteres")
        .optional(),
      cep: z.string({ message: "O CEP deve ser um texto" }).optional(),
      pais: z.string({ message: "O país deve ser um texto" }).optional(),
    })
    .default({}),
});

fastify
  .withTypeProvider<ZodTypeProvider>()
  .post(
    "/escolas",
    { schema: { body: cadastrarEscolaSchema }, onRequest: [authenticate] },
    async function handle(request) {
      const usecase = container.get(CadastarEscolaUseCase);

      return usecase.executar(request.body);
    }
  );

await fastify.listen({ port: Number(process.env.PORT) });

fastify.log.info(`Servidor rodando na porta ${process.env.PORT}!`);
