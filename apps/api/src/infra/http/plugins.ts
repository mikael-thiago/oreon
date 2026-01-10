import type { FastifyInstance, FastifyReply } from "fastify";
import { Result } from "../../domain/shared/result.js";
import { handleError } from "./handle-error.js";

declare module "fastify" {
  interface FastifyReply {
    replyResult(data: Result<unknown, unknown>, sucessStatus?: number): void;
  }
}

export function handleResultResponse(fastify: FastifyInstance) {
  fastify.decorateReply(
    "replyResult",
    function (this: FastifyReply, data: Result<unknown, unknown>, successStatus: number = 200) {
      if (Result.isOk(data)) {
        return this.status(successStatus).send(data.value);
      }

      handleError(data.erro, this.request, this);
    }
  );
}
