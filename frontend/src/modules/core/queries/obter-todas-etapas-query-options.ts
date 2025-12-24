import { queryOptions } from "@tanstack/react-query";
import { etapaService } from "../services/etapa-service";

export const obterTodasEtapasQueryOptions = queryOptions({
  queryKey: ["etapas", "all"],
  queryFn: () => etapaService.obterEtapas(),
});
