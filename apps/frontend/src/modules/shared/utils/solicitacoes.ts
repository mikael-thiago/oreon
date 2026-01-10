export function formatStatus(status: string) {
  switch (status) {
    case "cancelada":
      return "Cancelada";
    case "aguardando-pagamento":
      return "Aguardando Pagamento";
    case "em-andamento":
      return "Em Andamento";
    case "aprovada":
      return "Aprovada";
  }
}
