export abstract class UnitOfWork {
  abstract transact<Result = unknown>(fn: () => Promise<Result>): Promise<Result>;
}
