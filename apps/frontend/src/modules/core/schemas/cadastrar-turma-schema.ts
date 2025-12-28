import { z } from "zod";

export const cadastrarTurmaSchema = z.object({
  anoLetivoId: z
    .number({
      message: "O ID do ano letivo é obrigatório",
    })
    .int("O ID do ano letivo deve ser um número inteiro")
    .positive("O ID do ano letivo deve ser um número positivo"),
  baseId: z
    .number({
      message: "O ID da base é obrigatório",
    })
    .int("O ID da base deve ser um número inteiro")
    .positive("O ID da base deve ser um número positivo"),
  etapaId: z
    .number({
      message: "O ID da etapa é obrigatório",
    })
    .int("O ID da etapa deve ser um número inteiro")
    .positive("O ID da etapa deve ser um número positivo"),
  letra: z
    .string({
      message: "A letra da turma é obrigatória",
    })
    .length(1, "A letra da turma deve ter exatamente 1 caractere"),
  unidadeId: z
    .number({
      message: "O ID da unidade é obrigatório",
    })
    .int("O ID da unidade deve ser um número inteiro")
    .positive("O ID da unidade deve ser um número positivo"),
  limiteDeAlunos: z
    .number("A quantidade de alunos deve ser um número")
    .int("A quantidade de alunos deve ser um número inteiro")
    .positive("A quantidade de alunos deve ser um número positivo"),
});

export type CadastrarTurmaFormData = z.infer<typeof cadastrarTurmaSchema>;
