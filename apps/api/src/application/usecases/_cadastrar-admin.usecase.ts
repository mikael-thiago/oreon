import type { CriptografiaService } from "../interfaces/criptografia.service.js";
import { Result } from "../../domain/shared/result.js";

export type _CadastrarAdminRequest = {
  readonly nome: string;
  readonly email: string;
  readonly senha: string;
};

type _CadastrarAdminResponse = {
  readonly nome: string;
  readonly email: string;
  readonly senha: string;
};

export class _CadastrarAdminUseCase {
  constructor(private readonly criptografiaService: CriptografiaService) {}

  async executar(request: _CadastrarAdminRequest): Promise<Result<_CadastrarAdminResponse, never>> {
    const senhaHasheada = await this.criptografiaService.hashear(request.senha);

    return Result.ok({
      nome: request.nome,
      email: request.email,
      senha: senhaHasheada,
    });
  }
}
