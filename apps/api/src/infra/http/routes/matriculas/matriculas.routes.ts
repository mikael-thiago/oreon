import { parseDateIgnoringTimezone } from "@oreon/utils/date";
import { DateFormatEnum } from "@oreon/utils/date-format";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { MatriculasQueries } from "../../../../application/queries/matriculas.queries.js";
import { CriarMatriculaUseCase } from "../../../../application/usecases/criar-matricula.usecase.js";
import { ListarResumoSolicitacoesUseCase } from "../../../../application/usecases/listar-resumo-solicitacoes.usecase.js";
import { ListarSolicitacoesUseCase } from "../../../../application/usecases/listar-solicitacoes.usecase.js";
import { ObterDetalhesSolicitacaoUseCase } from "../../../../application/usecases/obter-detalhes-solicitacao.usecase.js";
import { SolicitarMatriculaUseCase } from "../../../../application/usecases/solicitar-matricula.usecase.js";
import { ValidationError } from "../../../../domain/errors/validation.error.js";
import { container } from "../../../di/di.js";
import { parseMultipartMatricula } from "../../utils/parse-multipart-matricula.js";
import { parseMultipartSolicitacao } from "../../utils/parse-multipart-solicitacao.js";
import {
  criarMatriculaFieldsSchema,
  listarMatriculasParamsSchema,
  listarResumoParamsSchema,
  obterDetalhesSolicitacaoParamsSchema,
  solicitarMatriculaFieldsSchema,
  solicitarMatriculaParamsSchema,
} from "./schemas.js";
import { Result } from "../../../../domain/shared/result.js";

export async function matriculasRoutes(fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/unidade/:unidadeId/periodo-letivo/:periodoLetivoId/matriculas",
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
    "/unidade/:unidadeId/periodo-letivo/:periodoLetivoId/modalidade/:modalidadeId/solicitacoes",
    {
      schema: { params: listarMatriculasParamsSchema },
      onRequest: [fastify.authenticate],
    },
    async function handle(request, reply) {
      const useCase = container.get(ListarSolicitacoesUseCase);
      const result = await useCase.executar({
        usuarioAutenticado: request.user,
        unidadeId: request.params.unidadeId,
        periodoLetivoId: request.params.periodoLetivoId,
        modalidadeId: request.params.modalidadeId,
      });
      reply.replyResult(result);
    }
  );

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/unidade/:unidadeId/periodo-letivo/:periodoLetivoId/solicitacoes/resumo",
    {
      schema: { params: listarResumoParamsSchema },
      onRequest: [fastify.authenticate],
    },
    async function handle(request, reply) {
      const useCase = container.get(ListarResumoSolicitacoesUseCase);

      const result = await useCase.executar({
        usuarioAutenticado: request.user,
        unidadeId: request.params.unidadeId,
        periodoLetivoId: request.params.periodoLetivoId,
      });

      reply.replyResult(result);
    }
  );

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/solicitacoes/:id",
    {
      schema: {
        params: obterDetalhesSolicitacaoParamsSchema,
      },
      onRequest: [fastify.authenticate],
    },
    async function handle(request, reply) {
      const useCase = container.get(ObterDetalhesSolicitacaoUseCase);
      const result = await useCase.executar({
        usuarioAutenticado: request.user,
        solicitacaoId: request.params.id,
      });
      reply.replyResult(result);
    }
  );

  fastify.post(
    "/matriculas",
    {
      onRequest: [fastify.authenticate],
    },
    async function handle(request, reply) {
      const { fields, comprovanteResidencia, historicoEscolar } = await parseMultipartMatricula(request);

      const rawData = {
        cpf: fields.cpf,
        nome: fields.nome,
        sexo: fields.sexo,
        dataDeNascimento: fields.dataDeNascimento,
        unidadeId: fields.unidadeId,
        periodoLetivoId: fields.periodoLetivoId,
      };

      const { cpf, nome, sexo, dataDeNascimento, unidadeId, periodoLetivoId } =
        criarMatriculaFieldsSchema.parse(rawData);

      if (!comprovanteResidencia || !historicoEscolar) {
        throw ValidationError.sintatico([
          { propriedade: "comprovanteResidencia", mensagem: "O comprovante de residência é obrigatório" },
          { propriedade: "historicoEscolar", mensagem: "O histórico escolar é obrigatório" },
        ]);
      }

      const usecase = container.get(CriarMatriculaUseCase);
      const result = await usecase.executar({
        usuarioAutenticado: request.user,
        cpf,
        nome,
        sexo,
        dataDeNascimento: new Date(dataDeNascimento),
        unidadeId,
        periodoLetivoId,
        comprovanteResidencia,
        historicoEscolar,
      });

      return reply.replyResult(Result.map(result, (id) => ({ id })));
    }
  );

  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/unidades/:unidadeId/solicitar-matricula",
    {
      schema: {
        params: solicitarMatriculaParamsSchema,
      },
      onRequest: [fastify.authenticate],
    },
    async function handle(request, reply) {
      const { fields, comprovanteResidencia, historicoEscolar, documentoAluno, documentoResponsavel } =
        await parseMultipartSolicitacao(request);

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

      const result = await usecase.executar({
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
        usuarioAutenticado: request.user,
      });

      reply.replyResult(result, 201);
    }
  );
}
