import { queryOptions } from "@tanstack/react-query";
import { disciplinaService } from "../services/disciplina.service";

export const obterDisciplinasQueryOptions = (unidadeId: number | null) =>
  queryOptions({
    queryKey: ["disciplinas", unidadeId],
    queryFn: () => disciplinaService.obterDisciplinas(unidadeId!),
    enabled: !!unidadeId,
  });
