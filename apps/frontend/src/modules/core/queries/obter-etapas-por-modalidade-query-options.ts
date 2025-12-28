import { queryOptions } from "@tanstack/react-query";
import { etapaService } from "../services/etapa-service";

export const obterEtapasPorModalidadeQueryOptions = (
  modalidadeId: number | null
) =>
  queryOptions({
    queryKey: ["etapas", modalidadeId],
    queryFn: () => {
      if (!modalidadeId) return [];
      return etapaService.obterEtapasPorModalidade(modalidadeId);
    },
    enabled: !!modalidadeId,
  });
