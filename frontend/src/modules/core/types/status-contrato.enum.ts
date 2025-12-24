export const StatusContratoEnum = {
  Ativo: "ativo",
  Inativo: "inativo",
} as const;

export type StatusContrato =
  (typeof StatusContratoEnum)[keyof typeof StatusContratoEnum];
