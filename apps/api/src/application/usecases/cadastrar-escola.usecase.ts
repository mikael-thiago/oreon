import { ConflictError } from "../../domain/errors/conflict.error.js";
import { ForbiddenError } from "../../domain/errors/forbidden.error.js";
import { IllegalArgumentError } from "../../domain/errors/illegal-argument.error.js";
import { EscolaRepository } from "../../domain/repositories/escola.repository.js";
import type { UsuarioRepository } from "../../domain/repositories/usuario.repository.js";
import { gerarStringAleatoria } from "../../infra/utils/string.js";
import type { CriptografiaService } from "../interfaces/criptografia.service.js";
import type { UnitOfWork } from "../interfaces/unit-of-work.interface.js";
import type { UsuarioAutenticado } from "../types/authenticated-user.type.js";

type CadastrarEscolaRequest = {
  readonly escola: {
    readonly nome: string;
    readonly email: string;
    readonly cnpjMatriz: string;
    readonly telefone1: string;
    readonly telefone2?: string | undefined;
    readonly endereco?:
      | {
          readonly rua?: string | undefined;
          readonly number?: string | undefined;
          readonly city?: string | undefined;
          readonly state?: string | undefined;
          readonly zipCode?: string | undefined;
          readonly country?: string | undefined;
        }
      | undefined;
  };

  readonly usuarioAutenticado: UsuarioAutenticado;
};

type CadastrarEscolaResponse = {
  readonly escola: {
    readonly id: number;
    readonly nome: string;
    readonly matriz: {
      readonly email: string;
      readonly telefone1: string;
      readonly cnpj: string;
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
  };
  readonly usuario: {
    readonly id: number;
    readonly email: string;
    readonly senha: string;
  };
};

export class CadastarEscolaUseCase {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly escolaRepository: EscolaRepository,
    private readonly criptografiaService: CriptografiaService,
    private readonly uow: UnitOfWork
  ) {}

  async executar(request: CadastrarEscolaRequest): Promise<CadastrarEscolaResponse> {
    const usuario = await this.usuarioRepository.obterUsuarioPorId(request.usuarioAutenticado.id);

    if (usuario === null)
      throw new IllegalArgumentError(`Usuário autenticado com ID ${request.usuarioAutenticado.id} não encontrado!`);
    if (!usuario.admin) throw new ForbiddenError("Operação permitida apenas para usuários admin");

    const existeComMesmoEmail = await this.escolaRepository.existeComEmail(request.escola.email);

    if (existeComMesmoEmail) {
      throw new ConflictError(`Já existe uma escola cadastrada com o email '${request.escola.email}'`);
    }

    return this.uow.transact(async () => {
      const escola = await this.escolaRepository.criarEscola({
        nome: request.escola.nome,
        email: request.escola.email,
        cnpjMatriz: request.escola.cnpjMatriz,
        telefone1: request.escola.telefone1,
        telefone2: request.escola.telefone2,
        endereco: request.escola.endereco,
      });

      const senha = gerarStringAleatoria(12);

      const usuarioEscola = await this.usuarioRepository.criarUsuario({
        login: request.escola.email,
        nome: request.escola.nome,
        escolaId: escola.id,
        senha: await this.criptografiaService.hashear(senha),
        root: true
      });

      return {
        escola: {
          id: escola.id,
          nome: escola.nome,
          matriz: {
            email: escola.email,
            cnpj: escola.matriz.cnpj,
            telefone1: escola.matriz.telefone1,
            telefone2: escola.matriz.telefone2 ?? null,
            endereco: escola.matriz.endereco,
            dataDeCriacao: escola.dataDeCriacao,
          },
        },
        usuario: {
          id: usuarioEscola.id,
          email: usuarioEscola.login,
          senha,
        },
      };
    });
  }
}
