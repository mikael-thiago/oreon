import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { MatriculasQueries } from "../../../application/queries/matriculas.queries.js";
import { CriarMatriculaUseCase } from "../../../application/usecases/criar-matricula.usecase.js";
import { container } from "../../di/di.js";

const listarMatriculasParamsSchema = z.object({
  unidadeId: z.coerce
    .number({
      error: (issue) =>
        issue.input === undefined ? "O ID da unidade é obrigatório" : "O ID da unidade deve ser um número",
    })
    .int("O ID da unidade deve ser um número inteiro")
    .positive("O ID da unidade deve ser um número positivo"),
  periodoLetivoId: z.coerce
    .number({
      error: (issue) =>
        issue.input === undefined
          ? "O ID do período letivo é obrigatório"
          : "O ID do período letivo deve ser um número",
    })
    .int("O ID do período letivo deve ser um número inteiro")
    .positive("O ID do período letivo deve ser um número positivo"),
});

export async function matriculasRoutes(fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/unidade/:unidadeId/periodoLetivo/:periodoLetivoId/matriculas",
    {
      schema: { params: listarMatriculasParamsSchema },
      onRequest: [fastify.authenticate],
    },
    async function handle(request) {
      const query = container.get(MatriculasQueries);
      return query.listarMatriculas({
        unidadeId: request.params.unidadeId,
        periodoLetivoId: request.params.periodoLetivoId,
      });
    }
  );

  fastify.post(
    "/matriculas",
    {
      onRequest: [fastify.authenticate],
    },
    async function handle(request, reply) {
      // Parse multipart form data
      const data = await request.file();

      if (!data) {
        return reply.status(400).send({ error: "Nenhum arquivo foi enviado" });
      }

      // Get form fields
      const fields = data.fields as Record<string, { value: string }>;
      const cpf = fields.cpf?.value;
      const nome = fields.nome?.value;
      const dataDeNascimentoStr = fields.dataDeNascimento?.value;
      const unidadeIdStr = fields.unidadeId?.value;
      const periodoLetivoIdStr = fields.periodoLetivoId?.value;

      // Validate required fields
      if (!cpf || !nome || !dataDeNascimentoStr || !unidadeIdStr || !periodoLetivoIdStr) {
        return reply.status(400).send({ error: "Campos obrigatórios faltando" });
      }

      // Get files
      const files = await request.files();
      let comprovanteResidencia: { fileName: string; content: Buffer } | null = null;
      let historicoEscolar: { fileName: string; content: Buffer } | null = null;

      for await (const file of files) {
        const buffer = await file.toBuffer();

        if (file.fieldname === "comprovanteResidencia") {
          comprovanteResidencia = {
            fileName: file.filename,
            content: buffer,
          };
        } else if (file.fieldname === "historicoEscolar") {
          historicoEscolar = {
            fileName: file.filename,
            content: buffer,
          };
        }
      }

      // Validate files
      if (!comprovanteResidencia || !historicoEscolar) {
        return reply.status(400).send({ error: "Comprovante de residência e histórico escolar são obrigatórios" });
      }

      const usecase = container.get(CriarMatriculaUseCase);
      const matriculaId = await usecase.executar({
        cpf,
        nome,
        dataDeNascimento: new Date(dataDeNascimentoStr),
        unidadeId: parseInt(unidadeIdStr, 10),
        periodoLetivoId: parseInt(periodoLetivoIdStr, 10),
        comprovanteResidencia,
        historicoEscolar,
      });

      return reply.status(201).send({ id: matriculaId });
    }
  );
}
