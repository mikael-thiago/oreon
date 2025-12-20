import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { handleError } from "./handleError.js";
import { anosLetivosRoutes } from "./routes/anos-letivos.routes.js";
import { authRoutes } from "./routes/auth.routes.js";
import { basesRoutes } from "./routes/bases.routes.js";
import { cargosRoutes } from "./routes/cargos.routes.js";
import { colaboradoresRoutes } from "./routes/colaboradores.routes.js";
import { escolasRoutes } from "./routes/escolas.routes.js";
import { modalidadesRoutes } from "./routes/modalidades.routes.js";
import { turmasRoutes } from "./routes/turmas.routes.js";
import { unidadesRoutes } from "./routes/unidades.routes.js";
import "./types.js";

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifyCookie, {
  secret: process.env.COOKIEs_SECRET!,
});

fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET!,
  cookie: {
    cookieName: "token",
    signed: false,
  },
});

fastify.register(fastifyCors, {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
});

async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
}

fastify.decorate("authenticate", authenticate);

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);
fastify.setErrorHandler(handleError);

fastify.get("/", async function handle(_, reply) {
  reply.status(200).send("Ok");
});

// Registrar rotas
fastify.register(authRoutes);
fastify.register(basesRoutes);
fastify.register(cargosRoutes);
fastify.register(colaboradoresRoutes);
fastify.register(escolasRoutes);
fastify.register(modalidadesRoutes);
fastify.register(anosLetivosRoutes);
fastify.register(turmasRoutes);
fastify.register(unidadesRoutes);

await fastify.listen({ port: Number(process.env.PORT) });

fastify.log.info(`Servidor rodando na porta ${process.env.PORT}!`);
