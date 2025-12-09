import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { flushSync } from "react-dom";
import { authService, type LoginRequest } from "../services/auth-service";

export type UsuarioLogado = {
  readonly id: number;
  readonly nome: string;
  readonly telefone: string;
  readonly email: string;
  readonly escolaId: number;
};

export type UnloggedState = {
  readonly state: "deslogado";
  readonly initialized: boolean;
  login(request: LoginRequest): Promise<void>;
  checkState(): Promise<LoggedState | UnloggedState>;
};

export type LoggingState = {
  readonly state: "logando";
};

export type LoggedState = {
  readonly state: "logado";
  readonly usuario: UsuarioLogado;
  logout(): Promise<void>;
};

export type UnloggingState = {
  readonly state: "deslogando";
  readonly usuario: UsuarioLogado;
};

export type CheckingState = {
  readonly state: "checking";
};

export type AuthState =
  | UnloggedState
  | CheckingState
  | LoggingState
  | LoggedState
  | UnloggingState;

export type ExcludeFunctions<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? never : K]: T[K];
};

export const AuthContext = createContext<AuthState>({
  state: "deslogado",
  initialized: false,
  async login() {},
  async checkState() {
    return this;
  },
});

export function AuthContextProvider(props: PropsWithChildren) {
  const [state, setState] = useState<ExcludeFunctions<AuthState>>({
    state: "deslogado",
    initialized: false,
  });

  const login = useCallback<UnloggedState["login"]>(
    async (request) => {
      setState({ state: "logando" });

      const usuario = await authService.login(request);

      setState({ state: "logado", usuario });
    },
    [state, setState]
  );

  const logout = useCallback<LoggedState["logout"]>(async () => {
    setState({ state: "deslogando", usuario: (state as LoggedState).usuario });

    await authService.logout();

    setState({ state: "deslogado", initialized: true });
  }, [state]);

  const checkState = useCallback<UnloggedState["checkState"]>(async (): Promise<
    LoggedState | UnloggedState
  > => {
    setState({ state: "checking" });

    const dados = await authService.me();

    let novoEstado: LoggedState | UnloggedState;

    if (dados === null) {
      novoEstado = {
        state: "deslogado",
        initialized: true,
        checkState,
        login,
      };
    } else {
      novoEstado = {
        state: "logado",
        usuario: dados,
        logout,
      };
    }

    flushSync(() => {
      setState(novoEstado);
    });
    return novoEstado;
  }, [state]);

  const value = useMemo<AuthState>(() => {
    switch (state.state) {
      case "deslogado":
        return {
          state: state.state,
          login,
          checkState,
          initialized: state.initialized,
        };
      case "checking":
        return { state: state.state };
      case "logando":
        return { state: state.state };
      case "logado":
        return { state: state.state, usuario: state.usuario, logout };
      case "deslogando":
        return { state: state.state, usuario: state.usuario };
    }
  }, [state.state]);

  return <AuthContext value={value}>{props.children}</AuthContext>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);

  if (!ctx) throw new Error("AuthContext não fornecido!");

  return ctx;
}

export function useLoggedState({ orElse }: { orElse?: Function } = {}) {
  const ctx = useAuthContext();

  if (ctx.state !== "logado") {
    if (orElse) return orElse();
    else return;
  }

  return ctx;
}

export function useAuthState<State extends AuthState["state"]>(
  state: State,
  { orElse }: { orElse?: Function } = {}
): Extract<AuthState, { readonly state: State }> {
  const ctx = useAuthContext();

  if (ctx.state !== state) {
    if (orElse) orElse();
    else throw new Error("");
  }

  return ctx as Extract<AuthState, { readonly state: State }>;
}
