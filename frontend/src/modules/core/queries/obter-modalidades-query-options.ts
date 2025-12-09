import { queryOptions } from "@tanstack/react-query";
import { modalidadeService } from "../services/modalidade-service";

export const obterModalidadesQueryOptions = queryOptions({
  queryKey: ["modalidades"],
  queryFn: () => modalidadeService.obterModalidades(),
});
