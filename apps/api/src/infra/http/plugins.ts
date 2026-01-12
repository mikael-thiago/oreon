import type { FastifyInstance, FastifyReply } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { Result } from "../../domain/shared/result.js";
import { handleError } from "./handle-error.js";

declare module "fastify" {
  interface FastifyReply {
    replyResult(data: Result<unknown, unknown>, sucessStatus?: number): Promise<void>;
  }
}

function handleResultResponsePlugin(fastify: FastifyInstance) {
  fastify.decorateReply(
    "replyResult",
    function (this: FastifyReply, data: Result<unknown, unknown>, successStatus: number = 200) {
      if (Result.isOk(data)) {
        return this.status(successStatus).send(data.value);
      }

      return handleError(data.erro, this.request, this);
    }
  );

  console.log("replyResult decorate", fastify.hasReplyDecorator('replyResult'));
}

export const handleResultResponse = fastifyPlugin(handleResultResponsePlugin);
