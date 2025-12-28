import { z } from "zod";

export const solicitarMatriculaSchema = z.object({
  cpf: z
    .string({ message: "O CPF do aluno é obrigatório" })
    .min(11, "O CPF do aluno deve ter no mínimo 11 caracteres")
    .max(14, "O CPF do aluno deve ter no máximo 14 caracteres")
    .regex(
      /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/,
      "O CPF do aluno deve estar no formato válido (000.000.000-00 ou 00000000000)"
    ),
  nome: z
    .string({ message: "O nome do aluno é obrigatório" })
    .min(3, "O nome do aluno deve ter no mínimo 3 caracteres")
    .max(255, "O nome do aluno deve ter no máximo 255 caracteres"),
  dataDeNascimento: z
    .string({ message: "A data de nascimento do aluno é obrigatória" })
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "A data de nascimento do aluno deve estar no formato YYYY-MM-DD"
    ),
  sexo: z
    .enum(["masculino", "feminino"], {
      message: "O sexo do aluno é obrigatório",
    }),
  periodoLetivoId: z
    .number({ message: "O ID do período letivo é obrigatório" })
    .positive("O ID do período letivo deve ser um número positivo"),
  modalidadeId: z
    .number({ message: "A modalidade é obrigatória" })
    .positive("A modalidade deve ser selecionada"),
  etapaId: z
    .number({ message: "A etapa é obrigatória" })
    .positive("A etapa deve ser selecionada"),
  responsavelNome: z
    .string({ message: "O nome do responsável é obrigatório" })
    .min(3, "O nome do responsável deve ter no mínimo 3 caracteres")
    .max(255, "O nome do responsável deve ter no máximo 255 caracteres"),
  responsavelCpf: z
    .string({ message: "O CPF do responsável é obrigatório" })
    .min(11, "O CPF do responsável deve ter no mínimo 11 caracteres")
    .max(14, "O CPF do responsável deve ter no máximo 14 caracteres")
    .regex(
      /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/,
      "O CPF do responsável deve estar no formato válido (000.000.000-00 ou 00000000000)"
    ),
  responsavelTelefone: z
    .string({ message: "O telefone do responsável é obrigatório" })
    .min(10, "O telefone deve ter no mínimo 10 caracteres")
    .max(15, "O telefone deve ter no máximo 15 caracteres"),
  responsavelEmail: z
    .string({ message: "O e-mail do responsável é obrigatório" })
    .email("E-mail do responsável inválido"),
  responsavelDataDeNascimento: z
    .string({ message: "A data de nascimento do responsável é obrigatória" })
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "A data de nascimento do responsável deve estar no formato YYYY-MM-DD"
    ),
  relacaoResponsabilidade: z
    .enum(["mae", "pai", "avo", "tio", "tia", "irmao", "irma", "outro"], {
      message: "A relação do responsável é obrigatória",
    }),
});

export type SolicitarMatriculaFormData = z.infer<
  typeof solicitarMatriculaSchema
>;
