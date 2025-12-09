import { ChevronsUpDown, GalleryVerticalEnd, Plus } from "lucide-react";
import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { UnidadeEscolarResponse } from "@/modules/core/services/escola-service";
import { Skeleton } from "./ui/skeleton";
import { formatCnpj } from "@/modules/shared/utils/cnpj";
import { useSessionContext } from "@/modules/shared/context/session-context";

export function TeamSwitcher({
  unidades,
  isLoading,
}: {
  readonly unidades: UnidadeEscolarResponse[];
  readonly isLoading: boolean;
}) {
  const { isMobile } = useSidebar();
  const { unidadeId, setUnidadeId } = useSessionContext();
  const [activeTeam, setActiveTeam] = React.useState(unidades?.[0] ?? null);

  React.useEffect(() => {
    if (!activeTeam && unidades.length > 0) {
      const firstUnidade = unidades[0];
      setActiveTeam(firstUnidade);
      setUnidadeId(firstUnidade.id);
    }
  }, [unidades, activeTeam, setUnidadeId]);

  React.useEffect(() => {
    if (unidadeId && unidades.length > 0) {
      const unidade = unidades.find((u) => u.id === unidadeId);
      if (unidade) {
        setActiveTeam(unidade);
      }
    }
  }, [unidadeId, unidades]);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 w-full p-2 pb-0">
        <Skeleton className="size-8 rounded-full bg-muted-foreground" />
        <div className="space-y-1 flex-auto">
          <Skeleton className="h-3 w-[90%] bg-muted-foreground" />
          <Skeleton className="h-2 w-[75%] bg-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!activeTeam) {
    return null;
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
                <GalleryVerticalEnd />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.nome}</span>
                <span className="truncate text-xs">
                  {formatCnpj(activeTeam.cnpj)}
                </span>
              </div>
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
              Unidades
            </DropdownMenuLabel>

            {unidades.map((unidade, index) => (
              <DropdownMenuItem
                key={unidade.id}
                onClick={() => {
                  setActiveTeam(unidade);
                  setUnidadeId(unidade.id);
                }}
                className="gap-2 p-2 cursor-pointer"
              >
                {/* <div className="flex size-6 items-center justify-center rounded-md border">
                  <team.logo className="size-3.5 shrink-0" />
                </div> */}
                {unidade.nome} - {formatCnpj(unidade.cnpj)}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2 cursor-pointer">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                Nova unidade
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
