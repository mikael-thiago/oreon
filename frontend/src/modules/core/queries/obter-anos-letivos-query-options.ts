import { queryOptions } from "@tanstack/react-query";
import { anoLetivoService } from "../services/ano-letivo-service";

export const obterAnosLetivosQueryOptions = queryOptions({
  queryKey: ["anos-letivos"],
  queryFn: () => anoLetivoService.obterAnosLetivos(),
});
