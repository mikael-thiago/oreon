import { queryOptions } from "@tanstack/react-query";
import { cargoService } from "../services/cargo-service";

export const obterCargosQueryOptions = queryOptions({
  queryKey: ["cargos"],
  queryFn: () => cargoService.obterCargos(),
});
