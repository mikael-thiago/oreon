import type { CampoDeExperiencia } from "../enums/campo-de-experiencia.enum.js";
import type { FaixaEtaria } from "../enums/faixa-etaria.enum.js";

type ObjetivoDeAprendizagemArgs = {
  readonly id: number;
  readonly faixaEtaria: FaixaEtaria;
  readonly campoDeExperiencia: CampoDeExperiencia;
  readonly sequencia: string;
};

export class ObjetivoDeAprendizagem {
  readonly id: number;
  readonly faixaEtaria: FaixaEtaria;
  readonly campoDeExperiencia: CampoDeExperiencia;
  readonly sequencia: string;

  constructor(args: ObjetivoDeAprendizagemArgs) {
    this.id = args.id;
    this.faixaEtaria = args.faixaEtaria;
    this.campoDeExperiencia = args.campoDeExperiencia;
    this.sequencia = args.sequencia;
  }

  getCodigo() {
    return `EI${this.faixaEtaria}${this.campoDeExperiencia}${this.sequencia}`;
  }
}
