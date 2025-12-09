import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { obterBasePorIdQueryOptions } from "../queries/obter-base-por-id-query-options";

export function DetalhesBaseCurricular() {
  const { id } = useParams({ strict: false });
  const baseId = Number(id);

  const { data: base, isPending } = useQuery(
    obterBasePorIdQueryOptions(baseId)
  );

  if (isPending) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-6 w-32" />
        <div className="space-y-2 mt-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!base) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Base curricular não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-2">{base.codigo}</h1>
      <p className="text-muted-foreground mb-1">Etapa: {base.etapa}</p>
      <p className="text-sm text-muted-foreground mb-6">
        Criada em: {new Date(base.dataCriacao).toLocaleDateString("pt-BR")}
      </p>

      <h2 className="text-xl font-semibold mb-4">Disciplinas</h2>

      {base.disciplinas.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma disciplina cadastrada.</p>
      ) : (
        <div className="space-y-2">
          {base.disciplinas.map((disciplina) => (
            <div
              key={disciplina.id}
              className="p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{disciplina.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    Carga horária anual: {disciplina.cargaHorariaAnual}h
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
