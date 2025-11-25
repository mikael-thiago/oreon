export abstract class CriptografiaService {
  abstract verificar(hash: string, plainValue: string): Promise<boolean>;
  abstract hashear(plainValue: string): Promise<string>;
}
