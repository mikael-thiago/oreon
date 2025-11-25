import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      id: number;
      email: string;
      escolaId: number;
    };
    user: {
      id: number;
      email: string;
      escolaId: number;
    };
  }
}
