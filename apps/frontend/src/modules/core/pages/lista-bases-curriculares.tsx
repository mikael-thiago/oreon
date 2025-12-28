import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionContext } from "@/modules/shared/context/session-context";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { BookOpen, ChevronRight, GraduationCap, Plus } from "lucide-react";
import { basesCurricularesQueryOptions } from "../queries/obter-bases-curriculares-query-options";

export function ListaBasesCurriculares() {
  const { unidadeId } = useSessionContext();

  const { data: bases = [], isPending } = useQuery(
    basesCurricularesQueryOptions(unidadeId)
  );

  if (!unidadeId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Bases Curriculares</h1>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <GraduationCap className="size-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">
            Selecione uma unidade para visualizar as bases curriculares
          </p>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Bases Curriculares</h1>
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
          <h1 className="text-2xl font-bold">Bases Curriculares</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {bases.length} {bases.length === 1 ? "base" : "bases"} encontrada
            {bases.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button asChild className="cursor-pointer">
          <Link to="/bases/cadastrar">
            <Plus className="size-4 mr-2" />
            Nova Base
          </Link>
        </Button>
      </div>

      {bases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
          <BookOpen className="size-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Nenhuma base curricular encontrada
          </h3>
          <p className="text-muted-foreground max-w-md">
            Esta unidade ainda não possui bases curriculares cadastradas.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {bases.map((base) => (
            <Link
              key={base.id}
              to={`/bases/$id`}
              params={{ id: String(base.id) }}
              className="group relative p-5 border rounded-lg hover:border-primary hover:shadow-md transition-all duration-200 bg-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <GraduationCap className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                      {base.codigo}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1">
                        {base.etapa}
                      </span>
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
