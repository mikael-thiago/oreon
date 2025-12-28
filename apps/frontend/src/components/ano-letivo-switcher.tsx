import { Calendar, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { AnoLetivoResponse } from "@/modules/core/services/ano-letivo-service";
import { useSessionContext } from "@/modules/shared/context/session-context";
import { Skeleton } from "./ui/skeleton";

export function AnoLetivoSwitcher({
  anosLetivos,
  isLoading,
}: {
  readonly anosLetivos: AnoLetivoResponse[];
  readonly isLoading: boolean;
}) {
  const { isMobile } = useSidebar();
  const { anoLetivoId, setAnoLetivoId } = useSessionContext();
  const activeAnoLetivo = React.useMemo(
    () => anosLetivos.find((anoLetivo) => anoLetivo.id === anoLetivoId) ?? null,
    [anosLetivos, anoLetivoId]
  );

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 w-full p-2 pb-0">
        <Skeleton className="size-8 rounded-lg bg-muted-foreground" />
        <div className="space-y-1 flex-auto">
          <Skeleton className="h-3 w-[90%] bg-muted-foreground" />
          <Skeleton className="h-2 w-[75%] bg-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Calendar className="size-4" />
              </div>

              {activeAnoLetivo && (
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Ano Letivo</span>
                  <span className="truncate text-xs">
                    {activeAnoLetivo.ano}
                  </span>
                </div>
              )}

              {!activeAnoLetivo && "Selecione..."}
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Anos Letivos
            </DropdownMenuLabel>

            {anosLetivos.map((anoLetivo) => (
              <DropdownMenuItem
                key={anoLetivo.id}
                onClick={() => setAnoLetivoId(anoLetivo.id)}
                className="gap-2 p-2 cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{anoLetivo.ano}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(anoLetivo.dataInicio).toLocaleDateString("pt-BR")}{" "}
                    - {new Date(anoLetivo.dataFim).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}

            <DropdownMenuItem
              onClick={() => setAnoLetivoId(null)}
              className="p-2 cursor-pointer"
            >
              <span className="font-medium">Nenhum</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
