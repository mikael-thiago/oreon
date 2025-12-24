import type { CriptografiaService } from "../interfaces/criptografia.service.js";

export type _CadastrarAdminRequest = {
  readonly nome: string;
  readonly email: string;
  readonly senha: string;
};

export class _CadastrarAdminUseCase {
  constructor(private readonly criptografiaService: CriptografiaService) {}

  async executar(request: _CadastrarAdminRequest) {
    return {
      nome: request.nome,
      email: request.email,
      senha: await this.criptografiaService.hashear(request.senha),
    };
  }
}
