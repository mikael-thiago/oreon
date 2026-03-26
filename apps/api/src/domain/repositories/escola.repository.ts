import { Escola } from "../entities/escola.entity.js";

export abstract class EscolaRepository {
    abstract obterProximoId(): Promise<number>;
    abstract existe(id: number): Promise<boolean>;
    abstract existeComEmail(email: string): Promise<boolean>;
    abstract existeComCnpj(email: string): Promise<boolean>;
    abstract salvar(escola: Escola): Promise<Escola>;
}