import { type FastifyError, type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import fastify from "@fastify/jwt";
import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";
import { ConflictError } from "../../domain/errors/conflict.error.js";
import { IllegalArgumentError } from "../../domain/errors/illegal-argument.error.js";
import { UnauthorizedError } from "../../domain/errors/unauthorized.error.js";
import { ForbiddenError } from "../../domain/errors/forbidden.error.js";
import { ValidationError } from "../../domain/errors/validation.error.js";

function isNoAuthorizationTokenInHeaderError(err: unknown): err is FastifyError {
  return typeof err === "object" && err !== null && "code" in err && err.code === "FST_JWT_NO_AUTHORIZATION_IN_HEADER";
}

function isNoAuthorizationTokenInCookieError(err: unknown): err is FastifyError {
  return typeof err === "object" && err !== null && "code" in err && err.code === "FST_JWT_NO_AUTHORIZATION_IN_COOKIE";
}

function isTokenExpired(err: unknown): err is FastifyError {
  return typeof err === "object" && err !== null && "code" in err && err.code === "FST_JWT_AUTHORIZATION_TOKEN_EXPIRED";
}

export function handleError(
  this: FastifyInstance,
  err: unknown,
  req: FastifyRequest,
  reply: FastifyReply
): any | Promise<any> {
  req.log.error(err);

  if (err instanceof UnauthorizedError) {
    return reply.status(err.status).send({
      type: err.type,
      status: err.status,
      mensagem: err.message,
    });
  }

  if (err instanceof ForbiddenError) {
    return reply.status(err.status).send({
      type: err.type,
      status: err.status,
      mensagem: err.message,
    });
  }

  if (err instanceof IllegalArgumentError) {
    return reply.status(err.status).send({
      type: err.type,
      status: err.status,
      mensagem: err.message,
    });
  }

  if (err instanceof ConflictError) {
    return reply.status(err.status).send({
      type: err.type,
      status: err.status,
      mensagem: err.message,
    });
  }

  if (err instanceof ValidationError) {
    return reply.status(err.status).send({
      type: err.type,
      status: err.status,
      erros: err.erros,
    });
  }

  if (hasZodFastifySchemaValidationErrors(err)) {
    return reply.status(400).send({
      type: "validation-error",
      status: 400,
      erros: err.validation.map((v) => ({
        propriedade: v.instancePath.replace("/", ".").slice(1),
        mensagem: v.message,
      })),
    });
  }

  if (isNoAuthorizationTokenInHeaderError(err)) {
    return reply.status(401).send({
      type: "unauthorized",
      status: 401,
      mensagem: "Token não fornecido no header 'Authentication'!",
    });
  }

  if (isNoAuthorizationTokenInCookieError(err)) {
    return reply.status(401).send({
      type: "unauthorized",
      status: 401,
      mensagem: "Token não fornecido nos cookies!",
    });
  }

  if (isTokenExpired(err)) {
    return reply.status(401).send({
      type: "unauthorized",
      status: 401,
      mensagem: "Token expirado!",
    });
  }

  return reply.status(500).send({
    status: 500,
    mensagem: "Ocorreu um erro",
  });
}
