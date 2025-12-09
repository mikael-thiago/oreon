import { queryOptions } from "@tanstack/react-query";
import { baseCurricularService } from "../services/base-curricular.service";

export const obterTodasBasesQueryOptions = queryOptions({
  queryKey: ["todas-bases"],
  queryFn: () => baseCurricularService.obterTodas(),
});
