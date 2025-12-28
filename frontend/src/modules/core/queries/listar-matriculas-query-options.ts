import { queryOptions } from "@tanstack/react-query";
import { matriculaService } from "../services/matricula-service";

export const listarMatriculasQueryOptions = (
  unidadeId: number | null,
  periodoLetivoId: number | null
) =>
  queryOptions({
    queryKey: ["matriculas", unidadeId, periodoLetivoId],
    queryFn: () => {
      if (!unidadeId || !periodoLetivoId) {
        return [];
      }
      return matriculaService.listar(unidadeId, periodoLetivoId);
    },
    enabled: !!unidadeId && !!periodoLetivoId,
  });
