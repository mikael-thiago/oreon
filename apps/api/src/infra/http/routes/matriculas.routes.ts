import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { MatriculasQueries } from "../../../application/queries/matriculas.queries.js";
import { CriarMatriculaUseCase } from "../../../application/usecases/criar-matricula.usecase.js";
import { SolicitarMatriculaUseCase } from "../../../application/usecases/solicitar-matricula.usecase.js";
import { ListarSolicitacoesUseCase } from "../../../application/usecases/listar-solicitacoes.usecase.js";
import { ObterDetalhesSolicitacaoUseCase } from "../../../application/usecases/obter-detalhes-solicitacao.usecase.js";
import { container } from "../../di/di.js";
import { ValidationError } from "../../../domain/errors/validation.error.js";
import { removerCaracteresEspeciais } from "@oreon/utils/string";
import { CPF_REGEX } from "@oreon/utils/cpf";
import { parseDateIgnoringTimezone } from "@oreon/utils/date";
import { DateFormatEnum } from "@oreon/utils/date-format";

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

const criarMatriculaFieldsSchema = z.object({
  cpf: z
    .string({
      error: (issue) =>
        issue.input === undefined || issue.input === null || issue.input === ""
          ? "O CPF é obrigatório"
          : "O CPF deve ser uma string",
    })
    .min(11, "O CPF deve ter no mínimo 11 caracteres")
    .max(14, "O CPF deve ter no máximo 14 caracteres")
    .regex(CPF_REGEX, "O CPF deve estar em um formato válido")
    .transform(removerCaracteresEspeciais),
  nome: z
    .string({
      error: (issue) =>
        issue.input === undefined || issue.input === null || issue.input === ""
          ? "O nome é obrigatório"
          : "O nome deve ser uma string",
    })
    .min(3, "O nome deve ter no mínimo 3 caracteres")
    .max(255, "O nome deve ter no máximo 255 caracteres"),
  sexo: z.enum(["masculino", "feminino"], {
    message: "O sexo deve ser 'masculino' ou 'feminino'",
  }),
  dataDeNascimento: z
    .string({
      error: (issue) =>
        issue.input === undefined || issue.input === null || issue.input === ""
          ? "A data de nascimento é obrigatória"
          : "A data de nascimento deve ser uma string",
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "A data de nascimento deve estar no formato YYYY-MM-DD")
    .refine(
      (date) => {
        const parsed = new Date(date);
        return !isNaN(parsed.getTime());
      },
      { message: "A data de nascimento deve ser uma data válida" }
    )
    .refine(
      (date) => {
        const parsed = new Date(date);
        return parsed <= new Date();
      },
      { message: "A data de nascimento não pode ser no futuro" }
    ),
  unidadeId: z.coerce
    .number({
      error: (issue) =>
        issue.input === undefined || issue.input === null || issue.input === ""
          ? "O ID da unidade é obrigatório"
          : "O ID da unidade deve ser um número",
    })
    .int("O ID da unidade deve ser um número inteiro")
    .positive("O ID da unidade deve ser um número positivo"),
  periodoLetivoId: z.coerce
    .number({
      error: (issue) =>
        issue.input === undefined || issue.input === null || issue.input === ""
          ? "O ID do período letivo é obrigatório"
          : "O ID do período letivo deve ser um número",
    })
    .int("O ID do período letivo deve ser um número inteiro")
    .positive("O ID do período letivo deve ser um número positivo"),
});

const solicitarMatriculaFieldsSchema = z.object({
  cpf: z
    .string()
    .min(11, "O CPF do aluno deve ter no mínimo 11 caracteres")
    .max(14, "O CPF do aluno deve ter no máximo 14 caracteres")
    .regex(CPF_REGEX, "O CPF do aluno deve estar em um formato válido")
    .transform(removerCaracteresEspeciais),
  nome: z.string().min(3, "O nome do aluno deve ter no mínimo 3 caracteres").max(255),
  sexo: z.enum(["masculino", "feminino"], {
    message: "O sexo deve ser 'masculino' ou 'feminino'",
  }),
  dataDeNascimento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "A data de nascimento deve estar no formato YYYY-MM-DD")
    .refine((date) => !isNaN(new Date(date).getTime()), {
      message: "A data de nascimento deve ser uma data válida",
    })
    .refine((date) => new Date(date) <= new Date(), {
      message: "A data de nascimento não pode ser no futuro",
    }),
  periodoLetivoId: z.coerce.number().int().positive("O ID do período letivo deve ser positivo"),
  etapaId: z.coerce.number().int().positive("O ID da etapa deve ser positivo"),
  relacaoResponsabilidade: z.enum(["mae", "pai", "avo", "ava", "tio", "tia", "irmao", "irma", "outro"], {
    message: "Relação de responsabilidade inválida",
  }),
  observacoes: z.string().max(255, "As observações devem ter no máximo 255 caracteres").optional(),
  responsavelNome: z.string().min(3, "O nome do responsável deve ter no mínimo 3 caracteres").max(255),
  responsavelCpf: z
    .string()
    .min(11, "O CPF do responsável deve ter no mínimo 11 caracteres")
    .max(14, "O CPF do responsável deve ter no máximo 14 caracteres")
    .regex(CPF_REGEX, "O CPF do responsável deve estar em um formato válido")
    .transform(removerCaracteresEspeciais),
  responsavelTelefone: z
    .string()
    .min(10, "O telefone deve ter no mínimo 10 caracteres")
    .max(15)
    .transform(removerCaracteresEspeciais),
  responsavelEmail: z.email({
    error: (issue) =>
      issue.input === undefined ? "O email do responsável é obrigatório" : "E-mail do responsável inválido",
  }),
  responsavelDataDeNascimento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "A data de nascimento do responsável deve estar no formato YYYY-MM-DD")
    .refine((date) => !isNaN(new Date(date).getTime()), {
      message: "A data de nascimento do responsável deve ser uma data válida",
    })
    .refine((date) => new Date(date) <= new Date(), {
      message: "A data de nascimento do responsável não pode ser no futuro",
    }),
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

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/unidade/:unidadeId/periodoLetivo/:periodoLetivoId/solicitacoes",
    {
      schema: { params: listarMatriculasParamsSchema },
      onRequest: [fastify.authenticate],
    },
    async function handle(request) {
      const useCase = container.get(ListarSolicitacoesUseCase);
      return useCase.executar({
        usuarioAutenticado: request.user,
        unidadeId: request.params.unidadeId,
        periodoLetivoId: request.params.periodoLetivoId,
      });
    }
  );

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/solicitacoes/:id",
    {
      schema: {
        params: z.object({
          id: z.coerce
            .number({
              error: (issue) =>
                issue.input === undefined
                  ? "O ID da solicitação é obrigatório"
                  : "O ID da solicitação deve ser um número",
            })
            .int("O ID da solicitação deve ser um número inteiro")
            .positive("O ID da solicitação deve ser um número positivo"),
        }),
      },
      onRequest: [fastify.authenticate],
    },
    async function handle(request) {
      const useCase = container.get(ObterDetalhesSolicitacaoUseCase);
      return useCase.executar({
        usuarioAutenticado: request.user,
        solicitacaoId: request.params.id,
      });
    }
  );

  fastify.post(
    "/matriculas",
    {
      onRequest: [fastify.authenticate],
    },
    async function handle(request, reply) {
      // Process all parts of the multipart request
      const parts = request.parts();
      const fields: Record<string, string> = {};
      let comprovanteResidencia: { fileName: string; content: Buffer } | null = null;
      let historicoEscolar: { fileName: string; content: Buffer } | null = null;

      for await (const part of parts) {
        if (part.type === "field") {
          fields[part.fieldname] = part.value as string;
        } else if (part.type === "file") {
          const buffer = await part.toBuffer();

          if (part.fieldname === "comprovanteResidencia") {
            comprovanteResidencia = {
              fileName: part.filename,
              content: buffer,
            };
          } else if (part.fieldname === "historicoEscolar") {
            historicoEscolar = {
              fileName: part.filename,
              content: buffer,
            };
          }
        }
      }

      // Prepare data for validation
      const rawData = {
        cpf: fields.cpf,
        nome: fields.nome,
        sexo: fields.sexo,
        dataDeNascimento: fields.dataDeNascimento,
        unidadeId: fields.unidadeId,
        periodoLetivoId: fields.periodoLetivoId,
      };

      // Validate fields with Zod schema
      const validationResult = criarMatriculaFieldsSchema.safeParse(rawData);
      if (!validationResult.success) {
        const errors = validationResult.error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return reply.status(400).send({ error: "Erro de validação", details: errors });
      }

      const { cpf, nome, sexo, dataDeNascimento, unidadeId, periodoLetivoId } = validationResult.data;

      // Validate files
      if (!comprovanteResidencia || !historicoEscolar) {
        return reply.status(400).send({ error: "Comprovante de residência e histórico escolar são obrigatórios" });
      }

      const usecase = container.get(CriarMatriculaUseCase);
      const matriculaId = await usecase.executar({
        cpf,
        nome,
        sexo,
        dataDeNascimento: new Date(dataDeNascimento),
        unidadeId,
        periodoLetivoId,
        comprovanteResidencia,
        historicoEscolar,
      });

      return reply.status(201).send({ id: matriculaId });
    }
  );

  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/unidades/:unidadeId/solicitar-matricula",
    {
      schema: {
        params: z.object({
          unidadeId: z.coerce
            .number({
              error: (issue) =>
                issue.input === undefined ? "O ID da unidade é obrigatório" : "O ID da unidade deve ser um número",
            })
            .int("O ID da unidade deve ser um número inteiro")
            .positive("O ID da unidade deve ser um número positivo"),
        }),
      },
      onRequest: [fastify.authenticate],
    },
    async function handle(request, reply) {
      const parts = request.parts();
      const fields: Record<string, string> = {};
      let comprovanteResidencia: { fileName: string; content: Buffer } | null = null;
      let historicoEscolar: { fileName: string; content: Buffer } | null = null;
      let documentoAluno: { fileName: string; content: Buffer } | null = null;
      let documentoResponsavel: { fileName: string; content: Buffer } | null = null;

      for await (const part of parts) {
        if (part.type === "field") {
          fields[part.fieldname] = part.value as string;
        } else if (part.type === "file") {
          const buffer = await part.toBuffer();

          if (part.fieldname === "comprovanteResidencia") {
            comprovanteResidencia = {
              fileName: part.filename,
              content: buffer,
            };
          } else if (part.fieldname === "historicoEscolar") {
            historicoEscolar = {
              fileName: part.filename,
              content: buffer,
            };
          } else if (part.fieldname === "documentoAluno") {
            documentoAluno = {
              fileName: part.filename,
              content: buffer,
            };
          } else if (part.fieldname === "documentoResponsavel") {
            documentoResponsavel = {
              fileName: part.filename,
              content: buffer,
            };
          }
        }
      }

      const rawData = {
        cpf: fields.cpf,
        nome: fields.nome,
        sexo: fields.sexo,
        dataDeNascimento: fields.dataDeNascimento,
        periodoLetivoId: fields.periodoLetivoId,
        etapaId: fields.etapaId,
        relacaoResponsabilidade: fields.relacaoResponsabilidade,
        observacoes: fields.observacoes,
        responsavelNome: fields.responsavelNome,
        responsavelCpf: fields.responsavelCpf,
        responsavelTelefone: fields.responsavelTelefone,
        responsavelEmail: fields.responsavelEmail,
        responsavelDataDeNascimento: fields.responsavelDataDeNascimento,
      };

      const validationResult = solicitarMatriculaFieldsSchema.parse(rawData);

      const {
        cpf,
        nome,
        sexo,
        dataDeNascimento,
        periodoLetivoId,
        etapaId,
        relacaoResponsabilidade,
        observacoes,
        responsavelNome,
        responsavelCpf,
        responsavelTelefone,
        responsavelEmail,
        responsavelDataDeNascimento,
      } = validationResult;

      if (!comprovanteResidencia || !historicoEscolar || !documentoAluno || !documentoResponsavel) {
        throw ValidationError.sintatico([
          { propriedade: "comprovanteResidencia", mensagem: "O comprovante de residência é obrigatório" },
          { propriedade: "historicoEscolar", mensagem: "O histórico escolar é obrigatório" },
          { propriedade: "documentoAluno", mensagem: "O documento do aluno é obrigatório" },
          { propriedade: "documentoResponsavel", mensagem: "O documento do responsável é obrigatório" },
        ]);
      }

      const usecase = container.get(SolicitarMatriculaUseCase);
      const solicitacaoId = await usecase.executar({
        cpf,
        nome,
        sexo,
        dataDeNascimento: parseDateIgnoringTimezone(dataDeNascimento, DateFormatEnum.ISO_DATE),
        unidadeId: request.params.unidadeId,
        periodoLetivoId,
        etapaId,
        relacaoResponsabilidade,
        observacoes,
        responsavel: {
          nome: responsavelNome,
          cpf: responsavelCpf,
          telefone: responsavelTelefone,
          email: responsavelEmail,
          dataDeNascimento: parseDateIgnoringTimezone(responsavelDataDeNascimento, DateFormatEnum.ISO_DATE),
        },
        comprovanteResidencia,
        historicoEscolar,
        documentoAluno,
        documentoResponsavel,
      });

      return reply.status(201).send({ id: solicitacaoId });
    }
  );
}
