import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionContext } from "@/modules/shared/context/session-context";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Users, ChevronRight, AlertCircle, Plus } from "lucide-react";
import { listarTurmasQueryOptions } from "../queries/listar-turmas-query-options";
import { ErroRequisicao } from "@/components/erro-requisicao";

export function ListarTurmas() {
  const { unidadeId, anoLetivoId } = useSessionContext();

  const {
    data: turmas = [],
    isPending,
    error,
    refetch,
  } = useQuery(listarTurmasQueryOptions(unidadeId, anoLetivoId));

  if (!unidadeId || !anoLetivoId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Turmas</h1>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="size-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">
            Selecione uma unidade e um ano letivo para visualizar as turmas
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErroRequisicao onTentarNovamente={refetch} />;
  }

  if (isPending) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Turmas</h1>
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
          <h1 className="text-2xl font-bold">Turmas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {turmas.length} {turmas.length === 1 ? "turma" : "turmas"}{" "}
            encontrada
            {turmas.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button asChild className="cursor-pointer">
          <Link to="/turmas/cadastrar">
            <Plus className="size-4 mr-2" />
            Nova Turma
          </Link>
        </Button>
      </div>

      {turmas.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
          <Users className="size-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Nenhuma turma encontrada
          </h3>
          <p className="text-muted-foreground max-w-md">
            Não há turmas cadastradas para esta unidade e ano letivo.
          </p>
        </div>
      )}

      {turmas.length > 0 && (
        <div className="grid gap-3">
          {turmas.map((turma) => (
            <Link
              key={turma.id}
              to={`/`}
              className="group relative p-5 border rounded-lg hover:border-primary hover:shadow-md transition-all duration-200 bg-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Users className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                      {turma.etapa} - {turma.letra}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Base Curricular: {turma.baseCurricular.codigo}
                    </p>
                  </div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
