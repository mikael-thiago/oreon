export interface CargoResponse {
  readonly id: number;
  readonly nome: string;
  readonly podeEnsinar: boolean;
}

export interface ICargoService {
  obterCargos(): Promise<CargoResponse[]>;
}

export class CargoService implements ICargoService {
  async obterCargos(): Promise<CargoResponse[]> {
    const response = await fetch(`http://localhost:4000/cargos`, {
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  }
}

export const cargoService: ICargoService = new CargoService();
