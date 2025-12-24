import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { CriptografiaService } from "../../../application/interfaces/criptografia.service.js";
import { type UsuarioAutenticado } from "../../../application/types/authenticated-user.type.js";
import { _CadastrarAdminUseCase } from "../../../application/usecases/_cadastrar-admin.usecase.js";
import { CadastrarUsuarioUseCase } from "../../../application/usecases/cadastrar-usuario.usecase.js";
import { LoginUseCase } from "../../../application/usecases/login.usecase.js";
import { ObterMeusDadosUseCase } from "../../../application/usecases/obter-meus-dados.usecase.js";
import { container } from "../../di/di.js";

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

const cadastrarUsuarioSchema = z.object({
  nome: z
    .string({
      error: (issue) => (issue.input === undefined ? "O nome é obrigatório" : "O nome deve ser um texto"),
    })
    .min(1, "O nome é obrigatório"),
  login: z
    .string({
      error: (issue) => (issue.input === undefined ? "O login é obrigatório" : "O login deve ser um texto"),
    })
    .email("O login deve ser email válido")
    .min(1, "O login é obrigatório"),
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

export async function authRoutes(fastify: FastifyInstance) {
  fastify
    .withTypeProvider<ZodTypeProvider>()
    .post("/login", { schema: { body: loginSchema } }, async function handle(request, reply) {
      const usecase = container.get(LoginUseCase);
      const resultado = await usecase.executar(request.body);

      reply.setCookie("token", resultado.token, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        sameSite: "strict",
        secure: false,
      });

      reply.status(200).send(resultado.usuario);
    });

  fastify.withTypeProvider<ZodTypeProvider>().post("/logout", function handle(_, reply) {
    reply.clearCookie("token");
    reply.status(204).send();
  });

  fastify
    .withTypeProvider<ZodTypeProvider>()
    .post("/usuarios", { schema: { body: cadastrarUsuarioSchema } }, async function handle(request, reply) {
      const usecase = container.get(CadastrarUsuarioUseCase);
      const usuario = await usecase.executar(request.body);
      reply.status(201).send(usuario);
    });

  fastify.get("/me", async function handle(request, reply) {
    try {
      const usuario = await request.jwtVerify<UsuarioAutenticado>();

      return container.get(ObterMeusDadosUseCase).executar(usuario);
    } catch {
      return null;
    }
  });

  fastify.post("/admin", function handle(request) {
    return new _CadastrarAdminUseCase(container.get(CriptografiaService)).executar(request.body as any);
  });
}
