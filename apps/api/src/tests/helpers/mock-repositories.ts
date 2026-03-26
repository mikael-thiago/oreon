import { AlunoRepository } from "../../domain/repositories/aluno.repository.js";
import { ResponsavelRepository } from "../../domain/repositories/responsavel.repository.js";
import { UsuarioRepository } from "../../domain/repositories/usuario.repository.js";
import { ColaboradorRepository } from "../../domain/repositories/colaborador.repository.js";
import { ContratoRepository } from "../../domain/repositories/contrato.repository.js";
import { MatriculaRepository } from "../../domain/repositories/matricula.repository.js";
import { UnidadeEscolarRepository } from "../../domain/repositories/unidade-escola.repository.js";
import { AnoLetivoRepository } from "../../domain/repositories/ano-letivo.repository.js";
import { CargoRepository } from "../../domain/repositories/cargo.repository.js";
import { TurmaRepository } from "../../domain/repositories/turma.repository.js";
import { SolicitacaoMatriculaRepository } from "../../domain/repositories/solicitacao-matricula.repository.js";
import {
  DocumentoRepository,
  type CriarDocumentoRequest,
  type AtualizarDocumentoRequest,
} from "../../domain/repositories/documento.repository.js";
import { EscolaRepository } from "../../domain/repositories/escola.repository.js";
import { BaseCurricularRepository } from "../../domain/repositories/base-curricular.repository.js";
import type { Aluno } from "../../domain/entities/aluno.entity.js";
import type { Responsavel } from "../../domain/entities/responsavel.entity.js";
import type { Usuario } from "../../domain/entities/usuario.entity.js";
import type { Colaborador } from "../../domain/entities/colaborador.entity.js";
import type { Contrato } from "../../domain/entities/contrato.entity.js";
import type { Matricula } from "../../domain/entities/matricula.entity.js";
import type { UnidadeEscolar } from "../../domain/entities/unidade-escolar.entity.js";
import type { AnoLetivo } from "../../domain/entities/ano-letivo.entity.js";
import type { Cargo } from "../../domain/entities/cargo.entity.js";
import type { Turma } from "../../domain/entities/turma.entity.js";
import type { SolicitacaoMatricula } from "../../domain/entities/solicitacao-matricula.entity.js";
import type { Documento } from "../../domain/entities/documento.entity.js";
import type { Escola } from "../../domain/entities/escola.entity.js";
import type { BaseCurricular } from "../../domain/entities/base-curricular.entity.js";

/**
 * In-memory implementation of AlunoRepository for testing
 * Stores entities in memory and implements real search logic
 */
export class InMemoryAlunoRepository implements AlunoRepository {
  private alunos: Aluno[] = [];
  private nextId = 1;

  async obterProximoId(): Promise<number> {
    return this.nextId++;
  }

  async obterAlunoPorCpf(cpf: string): Promise<Aluno | null> {
    return this.alunos.find((a) => a.cpfValor === cpf) ?? null;
  }

  async obterAlunoPorId(id: number): Promise<Aluno | null> {
    return this.alunos.find((a) => a.id === id) ?? null;
  }

  async salvar(aluno: Aluno): Promise<Aluno> {
    const existingIndex = this.alunos.findIndex((a) => a.id === aluno.id);

    if (existingIndex >= 0) {
      this.alunos[existingIndex] = aluno;
    } else {
      this.alunos.push(aluno);
    }

    return aluno;
  }

  // Test helpers
  reset(): void {
    this.alunos = [];
    this.nextId = 1;
  }

  seed(alunos: Aluno[]): void {
    this.alunos = [...alunos];
  }

  getAll(): Aluno[] {
    return [...this.alunos];
  }
}

/**
 * In-memory implementation of ResponsavelRepository for testing
 */
export class InMemoryResponsavelRepository implements ResponsavelRepository {
  private responsaveis: Responsavel[] = [];
  private nextId = 1;

  async obterProximoId(): Promise<number> {
    return this.nextId++;
  }

  async obterResponsavelPorCpf(cpf: string): Promise<Responsavel | null> {
    return this.responsaveis.find((r) => r.cpfValor === cpf) ?? null;
  }

  async obterResponsavelPorId(id: number): Promise<Responsavel | null> {
    return this.responsaveis.find((r) => r.id === id) ?? null;
  }

  async salvar(responsavel: Responsavel): Promise<Responsavel> {
    const existingIndex = this.responsaveis.findIndex((r) => r.id === responsavel.id);

    if (existingIndex >= 0) {
      this.responsaveis[existingIndex] = responsavel;
    } else {
      this.responsaveis.push(responsavel);
    }

    return responsavel;
  }

  // Test helpers
  reset(): void {
    this.responsaveis = [];
    this.nextId = 1;
  }

  seed(responsaveis: Responsavel[]): void {
    this.responsaveis = [...responsaveis];
  }

  getAll(): Responsavel[] {
    return [...this.responsaveis];
  }
}

/**
 * In-memory implementation of UsuarioRepository for testing
 */
export class InMemoryUsuarioRepository implements UsuarioRepository {
  private usuarios: Usuario[] = [];
  private nextId: number;

  constructor(startId: number = 1) {
    this.nextId = startId;
  }

  async obterProximoId(): Promise<number> {
    return this.nextId++;
  }

  async obterUsuarioPorId(id: number): Promise<Usuario | null> {
    return this.usuarios.find((u) => u.id === id) ?? null;
  }

  async obterUsuarioPorEmail(email: string): Promise<Usuario | null> {
    return this.usuarios.find((u) => u.login.toLowerCase() === email.toLowerCase()) ?? null;
  }

  async salvar(usuario: Usuario): Promise<Usuario> {
    const existingIndex = this.usuarios.findIndex((u) => u.id === usuario.id);

    if (existingIndex >= 0) {
      this.usuarios[existingIndex] = usuario;
    } else {
      this.usuarios.push(usuario);
    }

    return usuario;
  }

  // Test helpers
  reset(): void {
    this.usuarios = [];
    this.nextId = 1;
  }

  seed(usuarios: Usuario[]): void {
    this.usuarios = [...usuarios];
  }

  getAll(): Usuario[] {
    return [...this.usuarios];
  }
}

/**
 * In-memory implementation of ColaboradorRepository for testing
 */
export class InMemoryColaboradorRepository implements ColaboradorRepository {
  private colaboradores: Colaborador[] = [];
  private nextId = 1;

  async obterProximoId(): Promise<number> {
    return this.nextId++;
  }

  async obterColaboradorPorId(id: number): Promise<Colaborador | null> {
    return this.colaboradores.find((c) => c.id === id) ?? null;
  }

  async obterColaboradorPorCpf(cpf: string): Promise<Colaborador | null> {
    return this.colaboradores.find((c) => c.cpfValor === cpf) ?? null;
  }

  async obterColaboradorPorEmail(email: string): Promise<Colaborador | null> {
    return this.colaboradores.find((c) => c.emailValor === email.toLowerCase()) ?? null;
  }

  async obterColaboradorPorUsuarioId(usuarioId: number): Promise<Colaborador | null> {
    return this.colaboradores.find((c) => c.usuario.id === usuarioId) ?? null;
  }

  async adicionar(colaborador: Colaborador): Promise<Colaborador> {
    this.colaboradores.push(colaborador);
    return colaborador;
  }

  // Test helpers
  reset(): void {
    this.colaboradores = [];
    this.nextId = 1;
  }

  seed(colaboradores: Colaborador[]): void {
    this.colaboradores = [...colaboradores];
  }

  getAll(): Colaborador[] {
    return [...this.colaboradores];
  }
}

/**
 * In-memory implementation of ContratoRepository for testing
 */
export class InMemoryContratoRepository implements ContratoRepository {
  private contratos: Contrato[] = [];
  private nextId = 1;

  async obterProximoId(): Promise<number> {
    return this.nextId++;
  }

  async salvar<TContrato extends Contrato>(contrato: TContrato): Promise<TContrato> {
    const existingIndex = this.contratos.findIndex((c) => c.id === contrato.id);

    if (existingIndex >= 0) {
      this.contratos[existingIndex] = contrato;
    } else {
      this.contratos.push(contrato);
    }

    return contrato;
  }

  async adicionar<TContrato extends Contrato>(contrato: TContrato): Promise<TContrato> {
    this.contratos.push(contrato);
    return contrato;
  }

  async obterContratoAtivoColaborador(colaboradorId: number): Promise<Contrato | null> {
    // Note: This is a simplified implementation
    // In real implementation, you'd need to join with colaborador table
    // For testing, we assume colaboradorId is stored somehow or passed via context
    return this.contratos.find((c) => c.status === "ativo") ?? null;
  }

  // Test helpers
  reset(): void {
    this.contratos = [];
    this.nextId = 1;
  }

  seed(contratos: Contrato[]): void {
    this.contratos = [...contratos];
  }

  getAll(): Contrato[] {
    return [...this.contratos];
  }
}

/**
 * In-memory implementation of MatriculaRepository for testing
 */
export class InMemoryMatriculaRepository implements MatriculaRepository {
  private matriculas: Matricula[] = [];
  private nextId = 1;

  async obterProximoId(): Promise<number> {
    return this.nextId++;
  }

  async obterMatriculaPorEstudanteEPeriodoLetivo(
    estudanteId: number,
    periodoLetivoId: number
  ): Promise<Matricula | null> {
    return this.matriculas.find((m) => m.estudanteId === estudanteId && m.periodoLetivoId === periodoLetivoId) ?? null;
  }

  async salvar(matricula: Matricula): Promise<Matricula> {
    const existingIndex = this.matriculas.findIndex((m) => m.id === matricula.id);

    if (existingIndex >= 0) {
      this.matriculas[existingIndex] = matricula;
    } else {
      this.matriculas.push(matricula);
    }

    return matricula;
  }

  // Test helpers
  reset(): void {
    this.matriculas = [];
    this.nextId = 1;
  }

  seed(matriculas: Matricula[]): void {
    this.matriculas = [...matriculas];
  }

  getAll(): Matricula[] {
    return [...this.matriculas];
  }
}

/**
 * In-memory implementation of UnidadeEscolarRepository for testing
 */
export class InMemoryUnidadeEscolarRepository implements UnidadeEscolarRepository {
  private unidades: UnidadeEscolar[] = [];
  private nextId = 1;

  async obterProximoId(): Promise<number> {
    return this.nextId++;
  }

  async existeComId(id: number): Promise<boolean> {
    return this.unidades.some((u) => u.id === id);
  }

  async obterUnidadePorId(id: number): Promise<UnidadeEscolar | null> {
    return this.unidades.find((u) => u.id === id) ?? null;
  }

  // Test helpers
  reset(): void {
    this.unidades = [];
    this.nextId = 1;
  }

  seed(unidades: UnidadeEscolar[]): void {
    this.unidades = [...unidades];
  }

  getAll(): UnidadeEscolar[] {
    return [...this.unidades];
  }
}

/**
 * In-memory implementation of AnoLetivoRepository for testing
 */
export class InMemoryAnoLetivoRepository implements AnoLetivoRepository {
  private anosLetivos: AnoLetivo[] = [];
  private nextId = 1;

  async obterProximoId(): Promise<number> {
    return this.nextId++;
  }

  async existe(id: number): Promise<boolean> {
    return this.anosLetivos.some((a) => a.id === id);
  }

  async obterAnoLetivoPorAno(escolaId: number, ano: number): Promise<AnoLetivo | null> {
    return this.anosLetivos.find((a) => a.escolaId === escolaId && a.ano === ano) ?? null;
  }

  async obterAnoLetivoPorData(escolaId: number, dataInicio: Date, dataFim: Date): Promise<AnoLetivo | null> {
    return (
      this.anosLetivos.find((a) => a.escolaId === escolaId && a.dataInicio <= dataFim && a.dataFim >= dataInicio) ??
      null
    );
  }

  async salvar(anoLetivo: AnoLetivo): Promise<AnoLetivo> {
    const existingIndex = this.anosLetivos.findIndex((a) => a.id === anoLetivo.id);

    if (existingIndex >= 0) {
      this.anosLetivos[existingIndex] = anoLetivo;
    } else {
      this.anosLetivos.push(anoLetivo);
    }

    return anoLetivo;
  }

  // Test helpers
  reset(): void {
    this.anosLetivos = [];
    this.nextId = 1;
  }

  seed(anosLetivos: AnoLetivo[]): void {
    this.anosLetivos = [...anosLetivos];
  }

  getAll(): AnoLetivo[] {
    return [...this.anosLetivos];
  }
}

/**
 * In-memory implementation of CargoRepository for testing
 */
export class InMemoryCargoRepository implements CargoRepository {
  private cargos: Cargo[] = [];
  private nextId = 1;

  async obterProximoId(): Promise<number> {
    return this.nextId++;
  }

  async obterCargoPorId(id: number): Promise<Cargo | null> {
    return this.cargos.find((c) => c.id === id) ?? null;
  }

  // Test helpers
  reset(): void {
    this.cargos = [];
    this.nextId = 1;
  }

  seed(cargos: Cargo[]): void {
    this.cargos = [...cargos];
  }

  getAll(): Cargo[] {
    return [...this.cargos];
  }
}

/**
 * In-memory implementation of TurmaRepository for testing
 */
export class InMemoryTurmaRepository implements TurmaRepository {
  private turmas: Turma[] = [];
  private nextId = 1;

  async obterProximoId(): Promise<number> {
    return this.nextId++;
  }

  async obterPorId(id: number): Promise<Turma | null> {
    return this.turmas.find((t) => t.id === id) ?? null;
  }

  async existeTurmaPorEtapaAnoELetra(request: {
    readonly anoLetivoId: number;
    readonly etapaId: number;
    readonly letra: string;
    readonly unidadeId: number;
  }): Promise<boolean> {
    return this.turmas.some(
      (t) =>
        t.anoLetivoId === request.anoLetivoId &&
        t.etapaId === request.etapaId &&
        t.letra === request.letra &&
        t.unidadeId === request.unidadeId
    );
  }

  async salvar(turma: Turma): Promise<Turma> {
    const existingIndex = this.turmas.findIndex((t) => t.id === turma.id);

    if (existingIndex >= 0) {
      this.turmas[existingIndex] = turma;
    } else {
      this.turmas.push(turma);
    }

    return turma;
  }

  // Test helpers
  reset(): void {
    this.turmas = [];
    this.nextId = 1;
  }

  seed(turmas: Turma[]): void {
    this.turmas = [...turmas];
  }

  getAll(): Turma[] {
    return [...this.turmas];
  }
}

/**
 * In-memory implementation of SolicitacaoMatriculaRepository for testing
 */
export class InMemorySolicitacaoMatriculaRepository implements SolicitacaoMatriculaRepository {
  private solicitacoes: SolicitacaoMatricula[] = [];
  private nextId = 1;

  async obterProximoId(): Promise<number> {
    return this.nextId++;
  }

  async salvar(solicitacao: SolicitacaoMatricula): Promise<SolicitacaoMatricula> {
    const existingIndex = this.solicitacoes.findIndex((s) => s.id === solicitacao.id);

    if (existingIndex >= 0) {
      this.solicitacoes[existingIndex] = solicitacao;
    } else {
      this.solicitacoes.push(solicitacao);
    }

    return solicitacao;
  }

  async obterSolicitacaoMatriculaPorEstudanteEPeriodoEscolar(
    estudanteId: number,
    periodoEscolarId: number
  ): Promise<SolicitacaoMatricula | null> {
    return (
      this.solicitacoes.find((s) => s.estudanteId === estudanteId && s.periodoEscolarId === periodoEscolarId) ?? null
    );
  }

  async obterSolicitacaoMatriculaPorId(id: number): Promise<SolicitacaoMatricula | null> {
    return this.solicitacoes.find((s) => s.id === id) ?? null;
  }

  // Test helpers
  reset(): void {
    this.solicitacoes = [];
    this.nextId = 1;
  }

  seed(solicitacoes: SolicitacaoMatricula[]): void {
    this.solicitacoes = [...solicitacoes];
  }

  getAll(): SolicitacaoMatricula[] {
    return [...this.solicitacoes];
  }
}

/**
 * In-memory implementation of DocumentoRepository for testing
 */
export class InMemoryDocumentoRepository implements DocumentoRepository {
  private documentos: Documento[] = [];
  private nextId = 1;

  async obterProximoId(): Promise<number> {
    return this.nextId++;
  }

  async criarDocumento(request: CriarDocumentoRequest): Promise<Documento> {
    const documento: Documento = {
      id: this.nextId++,
      conteudo: request.conteudo,
      status: "em-processamento",
    };

    this.documentos.push(documento);
    return documento;
  }

  async atualizarDocumento(request: AtualizarDocumentoRequest): Promise<Documento> {
    const documento = this.documentos.find((d) => d.id === request.id);

    if (!documento) {
      throw new Error(`Documento com ID ${request.id} não encontrado`);
    }

    (documento as any).url = request.url;
    return documento;
  }

  // Test helpers
  reset(): void {
    this.documentos = [];
    this.nextId = 1;
  }

  seed(documentos: Documento[]): void {
    this.documentos = [...documentos];
  }

  getAll(): Documento[] {
    return [...this.documentos];
  }

  getById(id: number): Documento | undefined {
    return this.documentos.find((d) => d.id === id);
  }
}

/**
 * In-memory implementation of EscolaRepository for testing
 */
export class InMemoryEscolaRepository implements EscolaRepository {
  private escolas: Escola[] = [];
  private nextId = 1;

  async obterProximoId(): Promise<number> {
    return this.nextId++;
  }

  async existe(id: number): Promise<boolean> {
    return this.escolas.some((e) => e.id === id);
  }

  
  async existeComCnpj(cnpj: string): Promise<boolean> {
    return this.escolas.some((e) => e.matriz.cnpj === cnpj);
  }

  async existeComEmail(email: string): Promise<boolean> {
    return this.escolas.some((e) => e.email.toLowerCase() === email.toLowerCase());
  }

  async salvar(escola: Escola): Promise<Escola> {
    const existingIndex = this.escolas.findIndex((e) => e.id === escola.id);

    if (existingIndex >= 0) {
      this.escolas[existingIndex] = escola;
    } else {
      this.escolas.push(escola);
    }

    return escola;
  }

  // Test helpers
  reset(): void {
    this.escolas = [];
    this.nextId = 1;
  }

  seed(escolas: Escola[]): void {
    this.escolas = [...escolas];
  }

  getAll(): Escola[] {
    return [...this.escolas];
  }
}

/**
 * In-memory implementation of BaseCurricularRepository for testing
 */
export class InMemoryBaseCurricularRepository implements BaseCurricularRepository {
  private bases: BaseCurricular[] = [];
  private nextId = 1;

  async obterProximoId(): Promise<number> {
    return this.nextId++;
  }

  async obterPorId(id: number): Promise<BaseCurricular | null> {
    return this.bases.find((b) => b.id === id) ?? null;
  }

  async existe(id: number): Promise<boolean> {
    return this.bases.some((b) => b.id === id);
  }

  async salvar(base: BaseCurricular): Promise<BaseCurricular> {
    const existingIndex = this.bases.findIndex((b) => b.id === base.id);

    if (existingIndex >= 0) {
      this.bases[existingIndex] = base;
    } else {
      this.bases.push(base);
    }

    return base;
  }

  async atualizar(base: BaseCurricular): Promise<BaseCurricular> {
    return this.salvar(base);
  }

  async obterSequencialPorEtapaEUnidade(request: {
    readonly etapaId: number;
    readonly unidadeId: number;
  }): Promise<number> {
    const basesCount = this.bases.filter(
      (b) => b.etapaId === request.etapaId && b.unidadeId === request.unidadeId
    ).length;
    return basesCount + 1;
  }

  async verificarExistenciaDeCodigoDeDisciplinaNaUnidade(codigo: string, unidadeId: number): Promise<boolean> {
    // Simplified implementation for testing
    return false;
  }

  // Test helpers
  reset(): void {
    this.bases = [];
    this.nextId = 1;
  }

  seed(bases: BaseCurricular[]): void {
    this.bases = [...bases];
  }

  getAll(): BaseCurricular[] {
    return [...this.bases];
  }
}
