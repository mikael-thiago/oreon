import { ConflictError } from "../../domain/errors/ConflictError.js";
import { EscolaRepository } from "../../domain/repositories/EscolaRepository.js";

type CadastrarEscolaRequest = {
  readonly nome: string;
  readonly email: string;
  readonly cnpj?: string;
  readonly telefone1: string;
  readonly telefone2?: string | undefined;
  readonly endereco?: {
    readonly rua?: string | undefined;
    readonly number?: string | undefined;
    readonly city?: string | undefined;
    readonly state?: string | undefined;
    readonly zipCode?: string | undefined;
    readonly country?: string | undefined;
  } | undefined;
};

type CadastrarEscolaResponse = {
  readonly id: number;
  readonly nome: string;
  readonly email: string;
  readonly telefone1: string;
  readonly cnpj: string | null;
  readonly telefone2: string | null;
  readonly endereco: {
    readonly rua: string | null;
    readonly numero: string | null;
    readonly cidade: string | null;
    readonly estado: string | null;
    readonly cep: string | null;
    readonly pais: string | null;
  };
  readonly dataDeCriacao: Date;
};

export class CadastarEscolaUseCase {
  constructor(private readonly escolaRepository: EscolaRepository) {}

  async executar(
    input: CadastrarEscolaRequest
  ): Promise<CadastrarEscolaResponse> {
    const existeComMesmoEmail = await this.escolaRepository.existeComEmail(
      input.email
    );

    if (existeComMesmoEmail) {
      throw new ConflictError(
        `Já existe uma escola cadastrada com o email '${input.email}'`
      );
    }

    const escola = await this.escolaRepository.criarEscola({
      nome: input.nome,
      email: input.email,
      telefone1: input.telefone1,
      telefone2: input.telefone2,
      endereco: input.endereco,
    });

    return {
      id: escola.id,
      nome: escola.nome,
      email: escola.email,
      cnpj: escola.cnpj,
      telefone1: escola.telefone1,
      telefone2: escola.telefone2,
      endereco: escola.endereco,
      dataDeCriacao: escola.dataDeCriacao,
    };
  }
}
