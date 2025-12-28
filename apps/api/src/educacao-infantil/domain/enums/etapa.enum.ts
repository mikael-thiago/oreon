export const EtapaEnum = {
  Infantil: "EI",
  Fundamental: "EF",
  Medio: "EM",
} as const;

export type Etapa = (typeof EtapaEnum)[keyof typeof EtapaEnum];
