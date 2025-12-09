import { redirect, type ParsedLocation } from "@tanstack/react-router";
import type { AuthState } from "../context/auth-context";

export const loggedGuard = ({
  context,
  location,
}: {
  context: AuthState;
  location: ParsedLocation;
}) => {
  if (context.state !== "logado") {
    throw redirect({
      to: "/login",
      search: {
        redirect: location.href,
      },
    });
  }
};
