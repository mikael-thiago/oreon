import { queryOptions } from "@tanstack/react-query";
import { baseCurricularService } from "../services/base-curricular.service";

export const obterBasePorIdQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["base-curricular", id],
    queryFn: () => baseCurricularService.obterBasePorId(id),
  });
