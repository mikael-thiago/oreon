export const RelacaoResponsabilidadeEnum = {
  Mae: "mae",
  Pai: "pai",
  Avo: "avo",
  Ava: "ava",
  Tio: "tio",
  Tia: "tia",
  Irmao: "irmao",
  Irma: "irma",
  Outro: "outro",
} as const;

export type RelacaoResponsabilidade =
  (typeof RelacaoResponsabilidadeEnum)[keyof typeof RelacaoResponsabilidadeEnum];
