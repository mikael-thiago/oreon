export type CargoListItem = {
  readonly id: number;
  readonly nome: string;
  readonly podeEnsinar: boolean;
};

export abstract class CargoQueries {
  abstract listarCargos(): Promise<CargoListItem[]>;
}
