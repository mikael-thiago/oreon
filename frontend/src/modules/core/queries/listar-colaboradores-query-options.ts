import { queryOptions } from "@tanstack/react-query";
import { colaboradorService } from "../services/colaborador-service";

export function listarColaboradoresQueryOptions(unidadeId?: number | null) {
  return queryOptions({
    queryKey: ["colaboradores"],
    queryFn: () => colaboradorService.listarColaboradores(unidadeId),
  });
}
