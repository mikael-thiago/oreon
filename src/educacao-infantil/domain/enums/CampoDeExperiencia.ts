export const CampoDeExperienciaEnum = {
  EuOutroNos: "EO",
  CorpoGestosMovimentos: "CG",
  TracosSonsCoresFormas: "TS",
  EscutaFalaPensamentoImaginacao: "EF",
  EspacosTemposQuantidadesRelacoesTransformacoes: "ET",
} as const;

export type CampoDeExperiencia =
  (typeof CampoDeExperienciaEnum)[keyof typeof CampoDeExperienciaEnum];
