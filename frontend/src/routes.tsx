import {
  Outlet,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { MainLayout } from "./layouts/main-layout";
import { queryClient } from "./main";
import type { AuthState } from "./modules/auth/context/auth-context";
import { loggedGuard } from "./modules/auth/guards/logged-guard";
import { unloggedGuard } from "./modules/auth/guards/unlogged-guard";
import { EmBreve } from "./components/em-breve";
import { Login } from "./modules/auth/pages/login";
import { CadastrarAnoLetivo } from "./modules/core/pages/cadastrar-ano-letivo";
import { CadastrarBaseCurricular } from "./modules/core/pages/cadastrar-base-curricular";
import { CadastrarTurma } from "./modules/core/pages/cadastrar-turma";
import { DetalhesBaseCurricular } from "./modules/core/pages/detalhes-base-curricular";
import { ListaBasesCurriculares } from "./modules/core/pages/lista-bases-curriculares";
import { ListarAnosLetivos } from "./modules/core/pages/listar-anos-letivos";
import { ListarTurmas } from "./modules/core/pages/listar-turmas";
import { unidadesEscolaresQueryOptions } from "./modules/core/queries/obter-unidades-escolares-query-options";

const rootRoute = createRootRouteWithContext<AuthState>()({
  component: () => (
    <>
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </>
  ),
  beforeLoad: async ({ context }) => {
    if (context.state === "deslogado" && !context.initialized) {
      return context.checkState();
    }
  },
});

const indexRootRoute = createRoute({
  path: "/",
  getParentRoute: () => rootRoute,
  beforeLoad: ({ context }) => {
    if (context.state === "deslogado")
      throw redirect({
        to: "/login",
      });

    if (context.state === "logado")
      throw redirect({
        to: "/home",
      });
  },
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
  beforeLoad: unloggedGuard,
});

const mainLayoutRoute = createRoute({
  id: "main",
  getParentRoute: () => rootRoute,
  component: MainLayout,
  beforeLoad: loggedGuard,
  async loader() {
    queryClient.ensureQueryData(unidadesEscolaresQueryOptions);
  },
});

const indexRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/home",
  component: () => null,
});

const basesRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/bases",
  component: ListaBasesCurriculares,
});

const baseDetalhesRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/bases/$id",
  component: DetalhesBaseCurricular,
});

const cadastrarBaseCurricularRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/bases/cadastrar",
  component: CadastrarBaseCurricular,
});

const anosLetivosRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/anos-letivos",
  component: ListarAnosLetivos,
});

const cadastrarAnoLetivoRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/anos-letivos/cadastrar",
  component: CadastrarAnoLetivo,
});

const turmasRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/turmas",
  component: ListarTurmas,
});

const cadastrarTurmaRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/turmas/cadastrar",
  component: CadastrarTurma,
});

const matriculasRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/matriculas",
  component: () => <div>Matrículas</div>,
});

const rhPessoasRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/rh/colaboradores",
  component: EmBreve,
});

const routeTree = rootRoute.addChildren([
  indexRootRoute,
  loginRoute,
  mainLayoutRoute.addChildren([
    indexRoute,
    basesRoute,
    cadastrarBaseCurricularRoute,
    baseDetalhesRoute,
    anosLetivosRoute,
    cadastrarAnoLetivoRoute,
    turmasRoute,
    cadastrarTurmaRoute,
    matriculasRoute,
    rhPessoasRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  context: {
    state: "deslogado",
    initialized: false,
    async checkState() {
      return this;
    },
    async login() {},
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
