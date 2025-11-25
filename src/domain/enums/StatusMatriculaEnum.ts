export const StatusMatriculaEnum = {
  Aprovada: "Aprovada",
  Ativa: "Ativa",
  Inativa: "Inativa",
  Cancelada: "Cancelada",
  Remanejada: "Remanejada",
} as const;

export type StatusMatricula =
  (typeof StatusMatriculaEnum)[keyof typeof StatusMatriculaEnum];
