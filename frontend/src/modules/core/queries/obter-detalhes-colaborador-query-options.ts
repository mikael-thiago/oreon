import { queryOptions } from "@tanstack/react-query";
import { colaboradorService } from "../services/colaborador-service";

export const obterDetalhesColaboradorQueryOptions = (
  unidadeId: number | null,
  colaboradorId: number | null
) =>
  queryOptions({
    queryKey: ["colaborador", "detalhes", unidadeId, colaboradorId],
    queryFn: () => colaboradorService.obterDetalhes(unidadeId!, colaboradorId!),
    enabled: !!unidadeId && !!colaboradorId,
  });
