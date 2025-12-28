import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionContext } from "@/modules/shared/context/session-context";
import { formatCpf } from "@/modules/shared/utils/cpf";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { obterDetalhesColaboradorQueryOptions } from "../queries/obter-detalhes-colaborador-query-options";
import { Button } from "@/components/ui/button";
import {
  StatusContratoEnum,
  type StatusContrato,
} from "../types/status-contrato.enum";
import { titleCase } from "@/modules/shared/utils/string";

export function DetalhesColaborador() {
  const { unidadeId } = useSessionContext();
  const { colaboradorId } = useParams({
    from: "/main/rh/colaboradores/$colaboradorId",
  });

  const {
    data: colaborador,
    isPending,
    error,
  } = useQuery(
    obterDetalhesColaboradorQueryOptions(
      unidadeId,
      colaboradorId ? Number(colaboradorId) : null
    )
  );

  if (!unidadeId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Detalhes do Colaborador</h1>
        <Alert>
          <AlertCircle className="size-4" />
          <AlertTitle>Unidade não selecionada</AlertTitle>
          <AlertDescription>
            Selecione uma unidade para visualizar os detalhes do colaborador.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="max-w-4xl space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Detalhes do Colaborador</h1>
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Erro ao carregar colaborador</AlertTitle>
          <AlertDescription>
            Não foi possível carregar os dados do colaborador.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!colaborador) {
    return null;
  }

  const contratosOrdenados = [...colaborador.contratos].sort(
    (a, b) =>
      new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime()
  );

  const getStatusBadge = (status: StatusContrato) => {
    switch (status) {
      case StatusContratoEnum.Ativo:
        return (
          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            {titleCase(status)}
          </span>
        );
      case StatusContratoEnum.Inativo:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
            {titleCase(status)}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
            {titleCase(status)}
          </span>
        );
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/rh/colaboradores">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{colaborador.nome}</h1>
          <p className="text-muted-foreground mt-1">
            Informações detalhadas do colaborador
          </p>
        </div>
      </div>

      <div className="max-w-6xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
            <CardDescription>
              Informações básicas do colaborador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Nome Completo
                </dt>
                <dd className="text-sm mt-1">{colaborador.nome}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  CPF
                </dt>
                <dd className="text-sm mt-1">{formatCpf(colaborador.cpf)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Email
                </dt>
                <dd className="text-sm mt-1">{colaborador.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Telefone
                </dt>
                <dd className="text-sm mt-1">{colaborador.telefone}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contratos</CardTitle>
            <CardDescription>
              Histórico completo de contratos do colaborador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Matrícula
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Cargo
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Salário
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Data de Início
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Data de Fim
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contratosOrdenados.map((contrato) => (
                    <tr key={contrato.id} className="border-b last:border-0">
                      <td className="py-3 px-4 text-sm">
                        {contrato.matricula}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {contrato.cargoNome}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(contrato.salario)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(contrato.dataInicio).toLocaleDateString(
                          "pt-BR"
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {contrato.dataFim
                          ? new Date(contrato.dataFim).toLocaleDateString(
                              "pt-BR"
                            )
                          : "-"}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {getStatusBadge(contrato.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
