import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionContext } from "@/modules/shared/context/session-context";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Calendar, AlertCircle, Plus } from "lucide-react";
import { obterAnosLetivosQueryOptions } from "../queries/obter-anos-letivos-query-options";

export function ListarAnosLetivos() {
  const { unidadeId } = useSessionContext();

  const { data: anosLetivos = [], isPending } = useQuery({
    ...obterAnosLetivosQueryOptions,
    enabled: !!unidadeId,
  });

  if (!unidadeId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Anos Letivos</h1>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="size-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">
            Selecione uma unidade para visualizar os anos letivos
          </p>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Anos Letivos</h1>
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Anos Letivos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {anosLetivos.length} ano{anosLetivos.length === 1 ? "" : "s"}{" "}
            letivo{anosLetivos.length === 1 ? "" : "s"} encontrado
            {anosLetivos.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button asChild className="cursor-pointer">
          <Link to="/anos-letivos/cadastrar">
            <Plus className="size-4 mr-2" />
            Novo Ano Letivo
          </Link>
        </Button>
      </div>

      {anosLetivos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
          <Calendar className="size-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Nenhum ano letivo encontrado
          </h3>
          <p className="text-muted-foreground max-w-md">
            Não há anos letivos cadastrados para esta unidade.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {anosLetivos.map((anoLetivo) => (
            <div
              key={anoLetivo.id}
              className="group relative p-5 border rounded-lg bg-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                    <Calendar className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1">
                      Ano Letivo {anoLetivo.ano}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(anoLetivo.dataInicio).toLocaleDateString(
                        "pt-BR"
                      )}{" "}
                      -{" "}
                      {new Date(anoLetivo.dataFim).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
