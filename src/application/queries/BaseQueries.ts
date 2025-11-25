export abstract class BaseCurricularQueries {
  abstract listarBases(): Promise<
    { id: number; etapa: string; codigo: string }[]
  >;
}
