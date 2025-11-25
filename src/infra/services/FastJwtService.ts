import { createSigner, type SignerAsync } from "fast-jwt";
import { JwtService } from "../../application/interfaces/JwtService.js";

export class FastJwtService implements JwtService {
  private readonly signer: typeof SignerAsync;

  constructor(jwtSecret: string) {
    this.signer = createSigner({
      key: async () => jwtSecret,
      expiresIn: 1000 * 60 * 60 * 24, // 1 dia
    });
  }

  async gerarToken(payload: Record<string, any>): Promise<string> {
    return this.signer(payload);
  }
}
