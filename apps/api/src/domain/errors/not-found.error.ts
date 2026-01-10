export class NotFoundError extends Error {
	readonly type = "not-found" as const;
	readonly status = 404;

	constructor(mensagem: string) {
		super(mensagem);
	}
}