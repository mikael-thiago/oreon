import { z } from "zod";

export const cadastrarMatriculaSchema = z.object({
  cpf: z
    .string({ message: "O CPF é obrigatório" })
    .min(11, "O CPF deve ter no mínimo 11 caracteres")
    .max(14, "O CPF deve ter no máximo 14 caracteres")
    .regex(
      /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/,
      "O CPF deve estar no formato válido (000.000.000-00 ou 00000000000)"
    ),
  nome: z
    .string({ message: "O nome é obrigatório" })
    .min(3, "O nome deve ter no mínimo 3 caracteres")
    .max(255, "O nome deve ter no máximo 255 caracteres"),
  dataDeNascimento: z
    .string({ message: "A data de nascimento é obrigatória" })
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "A data de nascimento deve estar no formato yyyy-MM-dd"
    ),
  unidadeId: z
    .number({ message: "O ID da unidade é obrigatório" })
    .positive("O ID da unidade deve ser um número positivo"),
  periodoLetivoId: z
    .number({ message: "O ID do período letivo é obrigatório" })
    .positive("O ID do período letivo deve ser um número positivo"),
});

export type CadastrarMatriculaFormData = z.infer<
  typeof cadastrarMatriculaSchema
>;
