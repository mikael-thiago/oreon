export const SexoEnum = {
  Masculino: "masculino",
  Feminino: "feminino",
} as const;

export type Sexo = (typeof SexoEnum)[keyof typeof SexoEnum];
