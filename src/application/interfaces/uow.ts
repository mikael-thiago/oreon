export abstract class Uow {
  abstract transact<Result = unknown>(fn: () => Promise<Result>): Promise<Result>;
}
