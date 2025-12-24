import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { CadastarEscolaUseCase } from "../../../application/usecases/cadastrar-escola.usecase.js";
import { container } from "../../di/di.js";

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
  cnpjMatriz: z.string({ error: (issue) => (issue.input === undefined ? "O CNPJ é obrigatório" : "") }).nonempty(),
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

export async function escolasRoutes(fastify: FastifyInstance) {
  fastify
    .withTypeProvider<ZodTypeProvider>()
    .post(
      "/escolas",
      { schema: { body: cadastrarEscolaSchema }, onRequest: [fastify.authenticate] },
      async function handle(request) {
        const usecase = container.get(CadastarEscolaUseCase);

        return usecase.executar({ escola: request.body, usuarioAutenticado: request.user });
      }
    );
}
