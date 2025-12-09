import argon2 from "argon2";
import type { CriptografiaService } from "../../application/interfaces/CriptografiaService.js";

export class Argon2CriptografiaService implements CriptografiaService {
  async verificar(hash: string, plainValue: string): Promise<boolean> {
    return argon2.verify(hash, plainValue);
  }

  async hashear(plainValue: string): Promise<string> {
    return argon2.hash(plainValue);
  }
}
