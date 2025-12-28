export abstract class JwtService {
  abstract gerarToken(payload: Record<string, any>): Promise<string>;
}
