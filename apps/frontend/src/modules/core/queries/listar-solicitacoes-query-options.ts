import { queryOptions } from "@tanstack/react-query";
import { matriculaService } from "../services/matricula-service";

export const listarSolicitacoesQueryOptions = (
  unidadeId: number | null,
  periodoLetivoId: number | null,
  modalidadeId: number | null
) =>
  queryOptions({
    queryKey: ["solicitacoes", unidadeId, periodoLetivoId, modalidadeId],
    queryFn: () => {
      if (!unidadeId || !periodoLetivoId || !modalidadeId) {
        return [];
      }
      return matriculaService.listarSolicitacoes(unidadeId, periodoLetivoId, modalidadeId);
    },
    enabled: !!unidadeId && !!periodoLetivoId,
  });
