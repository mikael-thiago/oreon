export const StatusSolicitacaoMatriculaEnum = {
  EmAndamento: "em-andamento",
  Aprovada: "aprovada",
  Cancelada: "cancelada",
  AguardandoPagamento: "aguardando-pagamento",
} as const;

export type StatusSolicitacaoMatricula =
  (typeof StatusSolicitacaoMatriculaEnum)[keyof typeof StatusSolicitacaoMatriculaEnum];
