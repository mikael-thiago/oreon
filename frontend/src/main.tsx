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

// TODO: Implementar exponential backoff
export const queryClient = new QueryClient();

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
