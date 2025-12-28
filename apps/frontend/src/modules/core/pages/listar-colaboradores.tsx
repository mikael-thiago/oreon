import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionContext } from "@/modules/shared/context/session-context";
import { formatCnpj } from "@/modules/shared/utils/cnpj";
import { formatCpf } from "@/modules/shared/utils/cpf";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Plus, Users } from "lucide-react";
import { listarColaboradoresQueryOptions } from "../queries/listar-colaboradores-query-options";

export function ListarColaboradores() {
  const { unidadeId } = useSessionContext();

  const { data: colaboradores = [], isPending } = useQuery(
    listarColaboradoresQueryOptions(unidadeId)
  );

  if (isPending) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Colaboradores</h1>
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
          <h1 className="text-2xl font-bold">Colaboradores</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {colaboradores.length} colaborador
            {colaboradores.length === 1 ? "" : "es"} encontrado
            {colaboradores.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button asChild className="cursor-pointer">
          <Link to="/rh/colaboradores/cadastrar">
            <Plus className="size-4 mr-2" />
            Novo Colaborador
          </Link>
        </Button>
      </div>

      {colaboradores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
          <Users className="size-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Nenhum colaborador encontrado
          </h3>
          <p className="text-muted-foreground max-w-md">
            Não há colaboradores cadastrados.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {colaboradores.map((colaborador) => (
            <div key={colaborador.id} className="p-5 border rounded-lg bg-card">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <Users className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1">
                    {colaborador.nome}
                  </h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-muted-foreground">
                    <div className="flex flex-col gap-1">
                      <p>
                        <span className="font-medium">CPF:</span>{" "}
                        {formatCpf(colaborador.cpf)}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        {colaborador.email}
                      </p>
                      <p>
                        <span className="font-medium">Telefone:</span>{" "}
                        {colaborador.telefone}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <p>
                        <strong className="font-medium">
                          Ultimo contrato
                        </strong>
                      </p>
                      <p>
                        <span className="font-medium">Unidade:</span>{" "}
                        {formatCnpj(colaborador.unidade.cnpj)}
                      </p>
                      <p>
                        <span className="font-medium">Cargo:</span>{" "}
                        {colaborador.contrato.cargo}
                      </p>
                      <p>
                        <span className="font-medium">Início:</span>{" "}
                        {new Date(
                          colaborador.contrato.dataInicio
                        ).toLocaleDateString("pt-BR")}
                      </p>

                      <p>
                        <span className="font-medium">Fim:</span>{" "}
                        {colaborador.contrato.dataFim
                          ? new Date(
                              colaborador.contrato.dataFim
                            ).toLocaleDateString("pt-BR")
                          : "-"}
                      </p>
                    </div>
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
