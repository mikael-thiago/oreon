import { z } from "zod";

export const cadastrarColaboradorSchema = z
  .object({
    nome: z
      .string({
        message: "O nome do colaborador é obrigatório",
      })
      .min(1, "O nome do colaborador é obrigatório"),
    cpf: z
      .string({
        message: "O CPF é obrigatório",
      })
      .length(11, "O CPF deve ter 11 dígitos")
      .regex(/^\d{11}$/, "O CPF deve conter apenas números"),
    telefone: z
      .string({
        message: "O telefone é obrigatório",
      })
      .min(1, "O telefone é obrigatório"),
    email: z.email({
      error: (issue) =>
        !issue.input ? "O email é obrigatório" : "O email deve ser válido",
    }),
    unidadeId: z
      .number({
        message: "O ID da unidade é obrigatório",
      })
      .int("O ID da unidade deve ser um número inteiro")
      .positive("O ID da unidade deve ser um número positivo"),
    contrato: z.object({
      cargoId: z
        .number({
          message: "O ID do cargo é obrigatório",
        })
        .int("O ID do cargo deve ser um número inteiro")
        .positive("O ID do cargo deve ser um número positivo"),
      salario: z
        .number({
          message: "O salário é obrigatório",
        })
        .positive("O salário deve ser um número positivo"),
      dataInicio: z.iso.date({
        error: (issue) =>
          issue.input
            ? "A data de início é obrigatória"
            : "A data deve estar no formato yyyy-MM-dd",
      }),
      dataFim: z.iso
        .date("A data de fim deve estar no formato yyyy-MM-dd")
        .optional()
        .or(z.literal("")),
      disciplinasPermitidas: z.array(
        z.object({
          disciplinaId: z
            .number({
              message: "O ID da disciplina é obrigatório",
            })
            .int("O ID da disciplina deve ser um número inteiro")
            .positive("Selecione uma disciplina"),
          etapasIds: z.array(
            z.number().int().positive()
          ).min(1, "Selecione pelo menos uma etapa para esta disciplina"),
        })
      ).optional(),
    }),
  })
  .refine(
    (data) => {
      if (data.contrato.dataFim) {
        const inicio = new Date(data.contrato.dataInicio);
        const fim = new Date(data.contrato.dataFim);
        return fim > inicio;
      }
      return true;
    },
    {
      message: "A data de fim deve ser posterior à data de início",
      path: ["contrato", "dataFim"],
    }
  );

export type CadastrarColaboradorFormData = z.infer<
  typeof cadastrarColaboradorSchema
>;
