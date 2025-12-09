import type {
  Ano,
  AnoOuBloco,
  BlocosArtes,
  BlocosEducacaoFisica,
} from "../enums/AnoOuBloco.js";
import {
  type ComponentCurricular,
  ComponentCurricularEnum,
} from "../enums/ComponentCurricular.js";

type HabilidadeArgs =
  | {
      readonly anoOuBloco: Ano;
      readonly componente: Exclude<
        ComponentCurricular,
        | typeof ComponentCurricularEnum.Arte
        | typeof ComponentCurricularEnum.LinguaPortuguesa
        | typeof ComponentCurricularEnum.EducacaoFisica
      >;
      readonly sequencial: string;
    }
  | {
      readonly anoOuBloco: BlocosArtes;
      readonly componente:
        | typeof ComponentCurricularEnum.Arte
        | typeof ComponentCurricularEnum.LinguaPortuguesa;
      readonly sequencial: string;
    }
  | {
      readonly anoOuBloco: BlocosEducacaoFisica;
      readonly componente: typeof ComponentCurricularEnum.EducacaoFisica;
      readonly sequencial: string;
    };

export class Habilidade {
  readonly anoOuBloco: AnoOuBloco;
  readonly componente: ComponentCurricular;
  readonly sequencial: string;

  constructor(args: HabilidadeArgs) {
    this.anoOuBloco = args.anoOuBloco;
    this.componente = args.componente;
    this.sequencial = args.sequencial;
  }

  getCodigo() {
    return `EF${this.anoOuBloco}${this.componente}${this.sequencial}`;
  }
}
