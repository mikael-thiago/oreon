import { Bot, SquareTerminal, Users } from "lucide-react";
import * as React from "react";

import { AnoLetivoSwitcher } from "@/components/ano-letivo-switcher";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuthContext } from "@/modules/auth/context/auth-context";
import { obterAnosLetivosQueryOptions } from "@/modules/core/queries/obter-anos-letivos-query-options";
import { unidadesEscolaresQueryOptions } from "@/modules/core/queries/obter-unidades-escolares-query-options";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

// This is sample data.
const data = [
  {
    title: "Gestão",
    url: "#",
    icon: SquareTerminal,
    isActive: true,
    items: [
      {
        title: "Bases Curriculares",
        url: "/bases",
      },
      {
        title: "Anos Letivos",
        url: "/anos-letivos",
      },
    ],
  },
  {
    title: "Matrícula",
    url: "#",
    icon: Bot,
    items: [
      {
        title: "Turmas",
        url: "/turmas",
      },
      // {
      //   title: "Matriculas",
      //   url: "/matriculas",
      // },
    ],
  },
  {
    title: "Recursos Humanos",
    url: "#",
    icon: Users,
    items: [
      {
        title: "Colaboradores",
        url: "/rh/colaboradores",
      },
      {
        title: "Cargos",
        url: "/rh/cargos",
      },
      {
        title: "Contratos",
        url: "/rh/contratos",
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const auth = useAuthContext();

  const { data: unidades = [], isPending } = useQuery(
    unidadesEscolaresQueryOptions
  );

  const { data: anosLetivos = [], isPending: isPendingAnosLetivos } = useQuery(
    obterAnosLetivosQueryOptions
  );

  if (auth.state !== "logado") return null;

  return (
    <Sidebar collapsible="icon" variant="sidebar" {...props}>
      <SidebarHeader>
        <TeamSwitcher unidades={unidades} isLoading={isPending} />
        <AnoLetivoSwitcher
          anosLetivos={anosLetivos}
          isLoading={isPendingAnosLetivos}
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Dashboard"
                className="cursor-pointer"
                asChild
              >
                <Link to="/">Painel</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <NavMain items={data} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser {...auth.usuario} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
