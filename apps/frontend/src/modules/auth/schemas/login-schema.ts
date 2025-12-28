import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({
      message: "O email é obrigatório",
    })
    .email("Digite um email válido"),
  senha: z
    .string({
      message: "A senha é obrigatória",
    })
    .min(1, "A senha é obrigatória"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
