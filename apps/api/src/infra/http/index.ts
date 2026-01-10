import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifyMultipart from "@fastify/multipart";
import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { randomUUID } from "node:crypto";
import { handleError } from "./handle-error.js";
import { handleResultResponse } from "./plugins.js";
import { anosLetivosRoutes } from "./routes/anos-letivos.routes.js";
import { authRoutes } from "./routes/auth.routes.js";
import { basesRoutes } from "./routes/bases.routes.js";
import { cargosRoutes } from "./routes/cargos.routes.js";
import { colaboradoresRoutes } from "./routes/colaboradores.routes.js";
import { documentosRoutes } from "./routes/documentos.routes.js";
import { escolasRoutes } from "./routes/escolas.routes.js";
import { matriculasRoutes } from "./routes/matriculas/matriculas.routes.js";
import { modalidadesRoutes } from "./routes/modalidades.routes.js";
import { turmasRoutes } from "./routes/turmas.routes.js";
import { unidadesRoutes } from "./routes/unidades.routes.js";
import "./types.js";

const fastify = Fastify({
  logger: true,
  genReqId: () => randomUUID(),
});

fastify.register(fastifyCookie, {
  secret: process.env.COOKIEs_SECRET!,
});

fastify.register(fastifyMultipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per file
    files: 4, // Maximum 4 files per request
  },
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

fastify.register(handleResultResponse);

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

// Registrar rotas com versionamento /v1
fastify.register(authRoutes, { prefix: "/v1" });
fastify.register(basesRoutes, { prefix: "/v1" });
fastify.register(cargosRoutes, { prefix: "/v1" });
fastify.register(colaboradoresRoutes, { prefix: "/v1" });
fastify.register(escolasRoutes, { prefix: "/v1" });
fastify.register(modalidadesRoutes, { prefix: "/v1" });
fastify.register(anosLetivosRoutes, { prefix: "/v1" });
fastify.register(turmasRoutes, { prefix: "/v1" });
fastify.register(unidadesRoutes, { prefix: "/v1" });
fastify.register(matriculasRoutes, { prefix: "/v1" });
fastify.register(documentosRoutes, { prefix: "/v1" });

await fastify.listen({ port: Number(process.env.PORT) });

fastify.log.info(`Servidor rodando na porta ${process.env.PORT}!`);
