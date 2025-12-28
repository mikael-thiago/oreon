import { CriptografiaService } from "../interfaces/criptografia.service.js";
import { JwtService } from "../interfaces/jwt.service.js";
import { UnauthorizedError } from "../../domain/errors/unauthorized.error.js";
import { UsuarioRepository } from "../../domain/repositories/usuario.repository.js";

export type LoginRequest = {
    readonly email: string;
    readonly senha: string;
}

export type LoginResponse = {
    readonly token: string;
    readonly usuario: {
        readonly id: number;
        readonly nome: string;
        readonly email: string;
        readonly telefone?: string | undefined;
        readonly escolaId: number;
    };
}

export class LoginUseCase {
    private readonly usuarioRepository: UsuarioRepository;
    private readonly criptografiaService: CriptografiaService;
    private readonly jwtService: JwtService;

    constructor(
        usuarioRepository: UsuarioRepository,
        criptografiaService: CriptografiaService,
        jwtService: JwtService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.criptografiaService = criptografiaService;
        this.jwtService = jwtService;
    }

    async executar(request: LoginRequest): Promise<LoginResponse> {
        const usuario = await this.usuarioRepository.obterUsuarioPorEmail(request.email);

        if (!usuario) {
            throw new UnauthorizedError("Email ou senha inválidos");
        }

        const senhaValida = await this.criptografiaService.verificar(
            usuario.senha,
            request.senha
        );

        if (!senhaValida) {
            throw new UnauthorizedError("Email ou senha inválidos");
        }

        const token = await this.jwtService.gerarToken({
            id: usuario.id,
            email: usuario.login,
            escolaId: usuario.escolaId,
        });

        return {
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.login,
                escolaId: usuario.escolaId,
            },
        };
    }
}