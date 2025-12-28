import { redirect } from "@tanstack/react-router";
import type { AuthState } from "../context/auth-context";

export const unloggedGuard = ({ context }: { context: AuthState }) => {
  if (context.state !== "deslogado") {
    throw redirect({
      to: "/",
    });
  }
};
