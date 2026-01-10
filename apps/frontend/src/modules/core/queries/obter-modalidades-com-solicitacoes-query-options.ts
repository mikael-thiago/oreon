import { queryOptions } from "@tanstack/react-query";
import { modalidadeService } from "../services/modalidade-service";

export function obterModalidadesComSolicitacoesQueryOptions(unidadeId: number | null, anoLetivoId: number | null) {
  return queryOptions({
    queryFn: () => {
      if (!unidadeId || !anoLetivoId) return [];
      return modalidadeService.obterModalidadesComMatriculas(unidadeId, anoLetivoId);
    },
    queryKey: ["obter-modalidades-com-solicitacoes", unidadeId, anoLetivoId],
    enabled: !!anoLetivoId && !!unidadeId,
  });
}
