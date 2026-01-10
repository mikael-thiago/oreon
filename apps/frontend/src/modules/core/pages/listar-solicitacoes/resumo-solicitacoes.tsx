import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionContext } from "@/modules/shared/context/session-context";
import { formatStatus } from "@/modules/shared/utils/solicitacoes";
import { useQuery } from "@tanstack/react-query";
import { matriculaService } from "../../services/matricula-service";

export type ResumoSolicitacoesProps = {};

export function ResumoSolicitacoes(props: ResumoSolicitacoesProps) {
  const { unidadeId, anoLetivoId } = useSessionContext();

  const { data: resumo, isPending } = useQuery({
    queryFn: () => {
      if (!anoLetivoId || !unidadeId) return null;

      return matriculaService.obterResumoSolicitacoes(unidadeId, anoLetivoId);
    },
    queryKey: ["obter-resumo-solicitacoes", unidadeId, anoLetivoId],
  });

  if (!unidadeId || !anoLetivoId) return null;

  return (
    <div className="flex gap-4">
      {isPending && (
        <>
          <Skeleton className="h-28 w-64 rounded-lg" />
          <Skeleton className="h-28 w-64 rounded-lg" />
          <Skeleton className="h-28 w-64 rounded-lg" />
          <Skeleton className="h-28 w-64 rounded-lg" />
        </>
      )}

      {!isPending && !!resumo && (
        <>
          <Card className="p-6 w-64">
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-bold text-3xl">{resumo.total}</span>
            </div>
          </Card>

          {resumo.statuses.map((status) => (
            <Card key={status.status} className="p-6 w-64">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-muted-foreground">{formatStatus(status.status)}</span>
                <span className="font-bold text-3xl">{status.quantidade}</span>
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
