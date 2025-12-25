export const StatusDocumentoEnum = {
  EmProcessamento: "em-processamento",
  Carregado: "carregado",
} as const;

export type StatusDocumento = (typeof StatusDocumentoEnum)[keyof typeof StatusDocumentoEnum];
