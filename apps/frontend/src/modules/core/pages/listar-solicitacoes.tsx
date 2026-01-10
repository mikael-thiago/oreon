import { ErroRequisicao } from "@/components/erro-requisicao";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSessionContext } from "@/modules/shared/context/session-context";
import { formatarTelefone } from "@/modules/shared/utils/telefone";
import { formatarCPF } from "@oreon/utils/cpf";
import { parseDateIgnoringTimezone } from "@oreon/utils/date";
import { DateFormatEnum } from "@oreon/utils/date-format";
import { DateFormatter } from "@oreon/utils/date-formatter";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AlertCircle, ChevronRight, FileText, Plus } from "lucide-react";
import { listarSolicitacoesQueryOptions } from "../queries/listar-solicitacoes-query-options";
import { obterModalidadesComSolicitacoesQueryOptions } from "../queries/obter-modalidades-com-solicitacoes-query-options";
import { ResumoSolicitacoes } from "./listar-solicitacoes/resumo-solicitacoes";
import { useEffect, useState } from "react";

function getStatusConfig(status: string) {
  switch (status) {
    case "aprovada":
      return {
        label: "Aprovada",
        className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      };
    case "rejeitada":
      return {
        label: "Rejeitada",
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      };
    default:
      return {
        label: "Em Andamento",
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      };
  }
}

function formatSolicitacaoDate(value: string) {
  return DateFormatter.format(
    parseDateIgnoringTimezone(value, DateFormatEnum.ISO_DATE),
    DateFormatEnum.BRAZIL_DATE_ONLY
  );
}

export function ListarSolicitacoes() {
  const { unidadeId, anoLetivoId } = useSessionContext();

  const [modalidadeId, setModalidadeId] = useState<number | null>(null);

  const {
    data: solicitacoes = [],
    isPending: isPendingSolicitacoes,
    error,
    refetch,
  } = useQuery(listarSolicitacoesQueryOptions(unidadeId, anoLetivoId, modalidadeId));

  const {
    data: modalidades = [],
    isPending: isPendingModalidades,
    error: modalidadesError,
  } = useQuery(obterModalidadesComSolicitacoesQueryOptions(unidadeId, anoLetivoId));

  useEffect(() => {
    if (modalidadeId === null) {
      setModalidadeId(modalidades[0]?.id ?? null);
    }

  }, [modalidades]);

  if (!unidadeId || !anoLetivoId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Solicitações de Matrícula</h1>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="size-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">
            Selecione uma unidade e um ano letivo para visualizar as solicitações de matrícula
          </p>
        </div>
      </div>
    );
  }

  if (error || modalidadesError) {
    return <ErroRequisicao onTentarNovamente={refetch} />;
  }

  if (isPendingModalidades) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Solicitações de Matrícula</h1>
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Solicitações de Matrícula</h1>
          <p className="text-sm text-muted-foreground mt-1">Visualize e gerencie as solicitações de matrícula</p>
        </div>

        <Button asChild className="cursor-pointer">
          <Link to="/matriculas/solicitar">
            <Plus className="size-4 mr-2" />
            Nova Solicitação
          </Link>
        </Button>
      </div>

      <div className="mb-4">
        <ResumoSolicitacoes />
      </div>

      <Tabs value={String(modalidadeId)} onValueChange={(value) => setModalidadeId(Number(value))}>
        <TabsList>
          {modalidades.map((modalidade) => (
            <TabsTrigger key={modalidade.id} value={String(modalidade.id)}>
              {modalidade.nome}{" "}
              <div className="p-1 px-2 ml-2 bg-muted rounded-full">{modalidade.quantidadeSolicitacoes}</div>
            </TabsTrigger>
          ))}
        </TabsList>

        {modalidades.map((modalidade) => (
          <TabsContent key={modalidade.id} value={String(modalidade.id)}>
            {isPendingSolicitacoes && (
              <>
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-40 w-full rounded-lg" />
              </>
            )}

            {!isPendingSolicitacoes && solicitacoes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
                <FileText className="size-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma solicitação encontrada</h3>
                <p className="text-muted-foreground max-w-md">
                  Não há solicitações de matrícula para esta unidade e ano letivo.
                </p>
              </div>
            )}

            {!isPendingSolicitacoes && solicitacoes.length > 0 && (
              <div className="grid gap-3">
                {solicitacoes.map((solicitacao) => {
                  const statusConfig = getStatusConfig(solicitacao.status);

                  return (
                    <Link
                      key={solicitacao.id}
                      to={`/solicitacoes/$id`}
                      params={{ id: String(solicitacao.id) }}
                      className="group relative p-5 border rounded-lg hover:border-primary hover:shadow-md transition-all duration-200 bg-card"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <FileText className="size-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                {solicitacao.estudante.nome}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}>
                                {statusConfig.label}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium">Aluno:</span> CPF {formatarCPF(solicitacao.estudante.cpf)}{" "}
                                • Nascimento: {formatSolicitacaoDate(solicitacao.estudante.dataDeNascimento)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium">Modalidade/Etapa:</span> {solicitacao.modalidade} -{" "}
                                {solicitacao.etapa}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium">Responsável:</span> {solicitacao.responsavel.nome} •{" "}
                                {formatarTelefone(solicitacao.responsavel.telefone)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium">Solicitado em:</span>{" "}
                                {formatSolicitacaoDate(solicitacao.dataSolicitacao)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
