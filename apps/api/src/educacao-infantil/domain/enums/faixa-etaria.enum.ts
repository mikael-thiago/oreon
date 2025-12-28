export const FaixaEtariaEnum = {
  Bebes: "01",
  CriancasBemPequenas: "02",
  CriancasPequenas: "03",
} as const;

export type FaixaEtaria =
  (typeof FaixaEtariaEnum)[keyof typeof FaixaEtariaEnum];
