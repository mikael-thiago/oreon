import { queryOptions } from "@tanstack/react-query";
import { turmaService } from "../services/turma-service";

export const listarTurmasQueryOptions = (
  unidadeId: number | null,
  anoLetivoId: number | null
) =>
  queryOptions({
    queryKey: ["turmas", unidadeId, anoLetivoId],
    queryFn: () => {
      if (!unidadeId || !anoLetivoId) return [];
      return turmaService.listarTurmas(unidadeId, anoLetivoId);
    },
    enabled: !!unidadeId && !!anoLetivoId,
  });
