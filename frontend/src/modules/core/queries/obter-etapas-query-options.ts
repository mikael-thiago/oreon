import { queryOptions } from "@tanstack/react-query";
import { etapaService } from "../services/etapa-service";

export function obterEtapasQueryOptions(modalidadeId: number | null) {
  return queryOptions({
    queryKey: ["etapas", modalidadeId],
    queryFn: () =>
      modalidadeId ? etapaService.obterEtapasPorModalidade(modalidadeId) : [],
    enabled: !!modalidadeId,
  });
}
