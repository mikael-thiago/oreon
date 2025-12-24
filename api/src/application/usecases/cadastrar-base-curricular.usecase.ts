import { IllegalArgumentError } from "../../domain/errors/illegal-argument.error.js";
import { ValidationError } from "../../domain/errors/validation.error.js";
import type { BaseCurricularRepository } from "../../domain/repositories/base-curricular.repository.js";
import type { DisciplinaRepository } from "../../domain/repositories/disciplina.repository.js";
import type { EscolaRepository } from "../../domain/repositories/escola.repository.js";
import type { UnidadeEscolarRepository } from "../../domain/repositories/unidade-escola.repository.js";
import { groupBy } from "../../infra/utils/array.js";
import { padStart } from "../../infra/utils/string.js";
import type { UnitOfWork } from "../interfaces/unit-of-work.interface.js";
import type { ModalidadesQueries } from "../queries/modalidades.queries.js";
import type { UsuarioAutenticado } from "../types/authenticated-user.type.js";

export type CadastrarBaseCurricularRequest = {
  readonly usuario: UsuarioAutenticado;
  readonly etapaId: number;
  readonly unidadeId: number;
  readonly disciplinas: {
    readonly nome: string;
    readonly codigo: string;
    readonly cargaHorariaAnual: number;
  }[];
};

export class CadastrarBaseUseCase {
  constructor(
    private readonly escolaRepository: EscolaRepository,
    private readonly baseRepository: BaseCurricularRepository,
    private readonly unidadeEscolarRepository: UnidadeEscolarRepository,
    private readonly disciplinaRepository: DisciplinaRepository,
    private readonly modalidadesQueries: ModalidadesQueries,
    private readonly uow: UnitOfWork
  ) {}

  async executar(request: CadastrarBaseCurricularRequest) {
    const [escolaExiste, unidadeExiste] = await Promise.all([
      this.escolaRepository.existe(request.usuario.escolaId),
      this.unidadeEscolarRepository.existeComId(request.unidadeId),
    ]);

    if (!escolaExiste) throw new IllegalArgumentError(`Escola com ID ${request.usuario.escolaId} não existe!`);
    if (!unidadeExiste) throw new IllegalArgumentError(`Unidade com ID ${request.unidadeId} não existe!`);

    const disciplinasAgrupadasPorNome = groupBy(request.disciplinas, (d) => d.nome);

    const disciplinasDuplicadas = Object.entries(disciplinasAgrupadasPorNome)
      .map((entry) => entry[1])
      .filter((group) => group.length > 1);

    if (disciplinasDuplicadas.length > 0) {
      throw new IllegalArgumentError(
        `Disciplinas duplicadas informadas: ${JSON.stringify(disciplinasDuplicadas, null, 2)}`
      );
    }

    const etapa = await this.modalidadesQueries.obterEtapaPorId(request.etapaId);

    if (!etapa) {
      throw new IllegalArgumentError(`Etapa com ID ${request.etapaId} não existe!`);
    }

    const modalidade = (await this.modalidadesQueries.obterModalidadePorId(etapa.modalidadeId))!;

    const sequencial = await this.baseRepository.obterSequencialPorEtapaEUnidade({
      unidadeId: request.unidadeId,
      etapaId: request.etapaId,
    });

    return this.uow.transact(async () => {
      const verificacaoExistencia = await Promise.all(
        request.disciplinas.map(async (disciplina) => {
          return {
            codigo: disciplina.codigo,
            existe: await this.baseRepository.verificarExistenciaDeCodigoDeDisciplinaNaUnidade(
              disciplina.codigo,
              request.unidadeId
            ),
          };
        })
      );

      const disciplinasComCodigoExistente = verificacaoExistencia.filter((verificacao) => verificacao.existe);

      if (disciplinasComCodigoExistente.length > 0) {
        throw ValidationError.semantico([
          {
            propriedade: "request.disciplinas",
            mensagem:
              `Os seguintes códigos já existem na unidade ${request.unidadeId}: ` +
              disciplinasComCodigoExistente.map((disciplina) => disciplina.codigo).join(", "),
          },
        ]);
      }

      const disciplinasDaBase = await Promise.all(
        request.disciplinas.map(async (disciplinaRequest) => {
          const disciplina = await this.disciplinaRepository.obterOuCriarNaEscola({
            nome: disciplinaRequest.nome,
            unidadeId: request.unidadeId,
          });

          return {
            id: disciplina.id,
            nome: disciplina.nome,
            slug: disciplina.slug,
            codigo: disciplinaRequest.codigo,
            cargaHorariaAnual: disciplinaRequest.cargaHorariaAnual,
          };
        })
      );

      return this.baseRepository.criarBaseCurricular({
        codigo: `BASEM${padStart(modalidade.id, 2, "0")}E${padStart(etapa.numero, 2, "0")}${padStart(
          sequencial,
          2,
          "0"
        )}`,
        etapaId: request.etapaId,
        disciplinas: disciplinasDaBase,
        unidadeId: request.unidadeId,
      });
    });
  }
}
