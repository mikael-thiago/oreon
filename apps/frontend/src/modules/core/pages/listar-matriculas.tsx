import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionContext } from "@/modules/shared/context/session-context";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { GraduationCap, ChevronRight, AlertCircle, Plus } from "lucide-react";
import { listarMatriculasQueryOptions } from "../queries/listar-matriculas-query-options";
import { ErroRequisicao } from "@/components/erro-requisicao";

export function ListarMatriculas() {
  const { unidadeId, anoLetivoId } = useSessionContext();

  const {
    data: matriculas = [],
    isPending,
    error,
    refetch,
  } = useQuery(listarMatriculasQueryOptions(unidadeId, anoLetivoId));

  if (!unidadeId || !anoLetivoId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Matrículas</h1>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="size-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">
            Selecione uma unidade e um ano letivo para visualizar as matrículas
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
        <h1 className="text-2xl font-bold mb-6">Matrículas</h1>
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
          <h1 className="text-2xl font-bold">Matrículas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {matriculas.length}{" "}
            {matriculas.length === 1 ? "matrícula" : "matrículas"} encontrada
            {matriculas.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button asChild className="cursor-pointer">
          <Link to="/matriculas/criar">
            <Plus className="size-4 mr-2" />
            Nova Matrícula
          </Link>
        </Button>
      </div>

      {matriculas.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
          <GraduationCap className="size-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Nenhuma matrícula encontrada
          </h3>
          <p className="text-muted-foreground max-w-md">
            Não há matrículas cadastradas para esta unidade e ano letivo.
          </p>
        </div>
      )}

      {matriculas.length > 0 && (
        <div className="grid gap-3">
          {matriculas.map((matricula) => (
            <Link
              key={matricula.id}
              to={`/matriculas/${matricula.id}`}
              className="group relative p-5 border rounded-lg hover:border-primary hover:shadow-md transition-all duration-200 bg-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <GraduationCap className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                      {matricula.estudante.nome}
                    </h3>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-muted-foreground">
                        CPF: {matricula.estudante.cpf}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Data de Nascimento:{" "}
                        {new Date(matricula.estudante.dataDeNascimento).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>
                    </div>
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
