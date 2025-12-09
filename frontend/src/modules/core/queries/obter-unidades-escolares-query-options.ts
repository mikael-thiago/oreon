import type { UndefinedInitialDataOptions } from "@tanstack/react-query";
import { escolaService } from "../services/escola-service";

export const unidadesEscolaresQueryOptions = {
  queryFn: () => escolaService.obterUnidadesEscolares(),
  queryKey: ["obter-unidades-escolares"],
} satisfies UndefinedInitialDataOptions;
