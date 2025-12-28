import { queryOptions } from "@tanstack/react-query";
import { matriculaService } from "../services/matricula-service";

export const listarSolicitacoesQueryOptions = (
  unidadeId: number | null,
  periodoLetivoId: number | null
) =>
  queryOptions({
    queryKey: ["solicitacoes", unidadeId, periodoLetivoId],
    queryFn: () => {
      if (!unidadeId || !periodoLetivoId) {
        return [];
      }
      return matriculaService.listarSolicitacoes(unidadeId, periodoLetivoId);
    },
    enabled: !!unidadeId && !!periodoLetivoId,
  });
