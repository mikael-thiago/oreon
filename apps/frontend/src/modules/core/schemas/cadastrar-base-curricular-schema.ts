import { z } from "zod";

export const cadastrarBaseCurricularSchema = z.object({
  etapaId: z.number().int().positive("Selecione uma etapa"),
  disciplinas: z
    .array(
      z.object({
        nome: z.string().min(1, "Nome é obrigatório"),
        codigo: z.string().min(1, "Código é obrigatório"),
        cargaHorariaAnual: z
          .number()
          .int()
          .positive("Carga horária deve ser maior que zero"),
      })
    )
    .min(1, "Adicione pelo menos uma disciplina"),
});

export type CadastrarBaseCurricularFormData = z.infer<
  typeof cadastrarBaseCurricularSchema
>;
