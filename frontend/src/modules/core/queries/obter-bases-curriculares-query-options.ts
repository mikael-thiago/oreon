import { queryOptions } from "@tanstack/react-query";
import { baseCurricularService } from "../services/base-curricular.service";

export function basesCurricularesQueryOptions(
  unidadeId: number | null,
  etapaId?: number | null
) {
  return queryOptions({
    queryKey: ["bases-curriculares", unidadeId, etapaId],
    queryFn: () =>
      unidadeId
        ? baseCurricularService.obterBases(
            unidadeId,
            etapaId ?? undefined
          )
        : [],
    enabled: !!unidadeId,
  });
}
