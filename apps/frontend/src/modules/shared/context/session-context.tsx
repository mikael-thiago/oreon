import React from "react";

type SessionState = {
  readonly unidadeId: number | null;
  readonly anoLetivoId: number | null;
};

export type SessionContextValue = SessionState & {
  readonly setUnidadeId: (unidadeId: number) => void;
  readonly setAnoLetivoId: (anoLetivoId: number | null) => void;
};

const SessionContext = React.createContext<SessionContextValue | null>(null);

const STORAGE_KEY = "session-state";

function getInitialState(): SessionState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load session state from localStorage:", error);
  }
  return {
    unidadeId: null,
    anoLetivoId: null,
  };
}

export function SessionContextProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const [state, setState] = React.useState<SessionState>(getInitialState);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save session state to localStorage:", error);
    }
  }, [state]);

  const setUnidadeId = React.useCallback((unidadeId: number) => {
    setState((prev) => ({ ...prev, unidadeId }));
  }, []);

  const setAnoLetivoId = React.useCallback((anoLetivoId: number | null) => {
    setState((prev) => ({ ...prev, anoLetivoId }));
  }, []);

  const value = React.useMemo(
    () => ({
      ...state,
      setUnidadeId,
      setAnoLetivoId,
    }),
    [state, setUnidadeId, setAnoLetivoId]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSessionContext() {
  const context = React.useContext(SessionContext);

  if (!context) {
    throw new Error(
      "useSessionContext must be used within SessionContextProvider"
    );
  }

  return context;
}
