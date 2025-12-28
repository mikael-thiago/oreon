import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";
import { Spinner } from "./components/ui/spinner.tsx";
import "./index.css";
import {
  AuthContextProvider,
  useAuthContext,
} from "./modules/auth/context/auth-context.tsx";
import { SessionContextProvider } from "./modules/shared/context/session-context.tsx";
import { router } from "./routes.tsx";

/**
 * Verifica se o erro é um erro de rede ou erro 503 (Service Unavailable)
 * Apenas esses erros devem ter retry com exponential backoff
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  // Não retry se já tentou 3 vezes
  if (failureCount >= 3) {
    return false;
  }

  // Erro de rede (TypeError, fetch failed, etc)
  if (error instanceof TypeError) {
    return true;
  }

  // Verifica se é um erro HTTP com status 503
  if (error && typeof error === "object" && "status" in error) {
    return (error as { status: number }).status === 503;
  }

  // Não retry para outros erros
  return false;
}

/**
 * Estratégia de exponential backoff para retry de queries
 * Tenta 3 vezes com delays crescentes: 1s, 2s, 4s
 * Apenas para erros de rede e 503 (Service Unavailable)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 60 * 1000, // 1 minuto
    },
    mutations: {
      retry: shouldRetry,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

function AppRouterProvider() {
  const auth = useAuthContext();

  if (auth.state === "checking") {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <Spinner className="size-16" />
      </div>
    );
  }

  return <RouterProvider router={router} context={auth} />;
}

function App() {
  return (
    // <StrictMode>
    <AuthContextProvider>
      <SessionContextProvider>
        <QueryClientProvider client={queryClient}>
          <AppRouterProvider />
        </QueryClientProvider>
      </SessionContextProvider>
    </AuthContextProvider>
    // </StrictMode>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
