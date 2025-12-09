export type LoginRequest = {
  readonly email: string;
  readonly senha: string;
};

export type MeResponse = {
  readonly id: number;
  readonly nome: string;
  readonly telefone: string;
  readonly email: string;
  readonly escolaId: number;
};

export interface IAuthService {
  login(request: LoginRequest): Promise<MeResponse>;
  me(): Promise<MeResponse | null>;
  logout(): Promise<void>;
}

const baseUrl = import.meta.env.VITE_API_URL!;

export class AuthService implements IAuthService {
  async logout(): Promise<void> {
    const result = await fetch(`${baseUrl}/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (!result.ok) throw Error(await result.json());
  }

  async me(): Promise<MeResponse | null> {
    await new Promise((resolve) => setTimeout(resolve, 1_000));

    const result = await fetch(`${baseUrl}/me`, {
      credentials: "include",
    });

    if (!result.ok) return null;

    return result.json();
  }

  async login(request: LoginRequest): Promise<MeResponse> {
    const result = await fetch(`${baseUrl}/login`, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!result.ok) {
      const error = await result.json();
      throw error;
    }

    return result.json();
  }
}

export const authService: IAuthService = new AuthService();
