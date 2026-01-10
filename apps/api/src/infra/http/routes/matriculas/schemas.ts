import z from "zod";
import { CPF_REGEX } from "@oreon/utils/cpf";
import { removerCaracteresEspeciais } from "@oreon/utils/string";

export const listarMatriculasParamsSchema = z.object({
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
  modalidadeId: z.coerce
    .number({
      error: (issue) =>
        issue.input === undefined
          ? "O ID da modalidade é obrigatório"
          : "O ID da modalidade deve ser um número",
    })
    .int("O ID da modalidade deve ser um número inteiro")
    .positive("O ID da modalidade deve ser um número positivo"),
});

export const listarResumoParamsSchema = z.object({
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

export const criarMatriculaFieldsSchema = z.object({
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
    .regex(/^\d{4}-\d{2}-\d{2}$/, "A data de nascimento deve estar no formato yyyy-MM-dd")
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

export const solicitarMatriculaFieldsSchema = z.object({
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
    .regex(/^\d{4}-\d{2}-\d{2}$/, "A data de nascimento deve estar no formato yyyy-MM-dd")
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
    .regex(/^\d{4}-\d{2}-\d{2}$/, "A data de nascimento do responsável deve estar no formato yyyy-MM-dd")
    .refine((date) => !isNaN(new Date(date).getTime()), {
      message: "A data de nascimento do responsável deve ser uma data válida",
    })
    .refine((date) => new Date(date) <= new Date(), {
      message: "A data de nascimento do responsável não pode ser no futuro",
    }),
});

export const obterDetalhesSolicitacaoParamsSchema = z.object({
  id: z.coerce
    .number({
      error: (issue) =>
        issue.input === undefined
          ? "O ID da solicitação é obrigatório"
          : "O ID da solicitação deve ser um número",
    })
    .int("O ID da solicitação deve ser um número inteiro")
    .positive("O ID da solicitação deve ser um número positivo"),
});

export const solicitarMatriculaParamsSchema = z.object({
  unidadeId: z.coerce
    .number({
      error: (issue) =>
        issue.input === undefined ? "O ID da unidade é obrigatório" : "O ID da unidade deve ser um número",
    })
    .int("O ID da unidade deve ser um número inteiro")
    .positive("O ID da unidade deve ser um número positivo"),
});
