export const AnoOuBlocoEnum = {
  "01": "01",
  "02": "02",
  "03": "03",
  "04": "04",
  "05": "05",
  "06": "06",
  "07": "07",
  "08": "08",
  "09": "09",
  PrimeiroAoQuinto: "15",
  SextoAoNono: "69",
  PrimeiroESegundo: "12",
  TerceiroAoQuinto: "35",
  SextoESetimo: "67",
  OitavoENono: "89",
} as const;

export type AnoOuBloco = (typeof AnoOuBlocoEnum)[keyof typeof AnoOuBlocoEnum];
export type BlocosArtes = Extract<AnoOuBloco, "15" | "69">;
export type BlocosEducacaoFisica = Extract<
  AnoOuBloco,
  "12" | "35" | "67" | "89"
>;
export type Ano = Exclude<AnoOuBloco, BlocosArtes | BlocosEducacaoFisica>;
