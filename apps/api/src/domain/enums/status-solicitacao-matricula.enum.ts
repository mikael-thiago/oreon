export const StatusSolicitacaoMatriculaEnum = {
  EmAndamento: "em-andamento",
  Aprovada: "aprovada",
  Rejeitada: "rejeitada",
} as const;

export type StatusSolicitacaoMatricula =
  (typeof StatusSolicitacaoMatriculaEnum)[keyof typeof StatusSolicitacaoMatriculaEnum];
