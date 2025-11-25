export const ComponentCurricularEnum = {
  Arte: "AR",
  Ciencia: "CI",
  EducacaoFisica: "EF",
  EnsinoReligioso: "ER",
  Geografia: "GR",
  Historia: "HI",
  LinguaInglesa: "LI",
  LinguaPortuguesa: "LP",
  Matematica: "MA",
} as const;

export type ComponentCurricular =
  (typeof ComponentCurricularEnum)[keyof typeof ComponentCurricularEnum];
