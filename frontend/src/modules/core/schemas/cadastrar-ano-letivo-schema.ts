import { z } from "zod";

export const cadastrarAnoLetivoSchema = z
  .object({
    anoReferencia: z
      .number({
        message: "O ano de referência é obrigatório",
      })
      .int("O ano de referência deve ser um número inteiro")
      .min(1900, "O ano de referência deve ser maior ou igual a 1900")
      .max(2100, "O ano de referência deve ser menor ou igual a 2100"),
    dataInicio: z.string({
      message: "A data de início é obrigatória",
    }),
    dataFim: z.string({
      message: "A data de fim é obrigatória",
    }),
  })
  .refine(
    (data) => {
      const inicio = new Date(data.dataInicio);
      const fim = new Date(data.dataFim);
      return fim > inicio;
    },
    {
      message: "A data de fim deve ser posterior à data de início",
      path: ["dataFim"],
    }
  );

export type CadastrarAnoLetivoFormData = z.infer<
  typeof cadastrarAnoLetivoSchema
>;
