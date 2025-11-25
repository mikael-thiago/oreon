import { Escola } from "../entities/Escola.js";

export abstract class EscolaRepository {
    abstract existe(id: number): Promise<boolean>;
    abstract existeComEmail(email: string): Promise<boolean>;
    abstract criarEscola(request: {
        readonly nome: string;
        readonly email: string;
        readonly telefone1: string;
        readonly telefone2?: string | undefined;
        readonly endereco?: {
            readonly rua?: string | undefined;
            readonly numero?: string | undefined;
            readonly cidade?: string | undefined;
            readonly estado?: string | undefined;
            readonly cep?: string | undefined;
            readonly pais?: string | undefined;
        } | undefined;
    }): Promise<Escola>;
}