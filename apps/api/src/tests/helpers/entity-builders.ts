import { Aluno, type CriarAlunoDTO } from "../../domain/entities/aluno.entity.js";
import { Responsavel, type CriarResponsavelDTO } from "../../domain/entities/responsavel.entity.js";
import { Colaborador, type CriarColaboradorDTO } from "../../domain/entities/colaborador.entity.js";
import { ContratoComum, type CriarContratoComumDTO } from "../../domain/entities/contrato.entity.js";
import { ContratoProfessor, type CriarContratoProfessorDTO } from "../../domain/entities/contrato.entity.js";
import { Matricula, type CriarMatriculaDTO } from "../../domain/entities/matricula.entity.js";
import { Turma } from "../../domain/entities/turma.entity.js";
import { SexoEnum, type Sexo } from "../../domain/enums/sexo.enum.js";
import { StatusContratoEnum, type StatusContrato } from "../../domain/enums/status-contrato.enum.js";
import { StatusMatriculaEnum, type StatusMatricula } from "../../domain/enums/status-matricula.enum.js";
import { VALID_CPFS, VALID_EMAILS, VALID_PHONES, VALID_NAMES, TEST_DATES, TEST_MONEY } from "./test-data.js";
import type { Result } from "../../domain/shared/result.js";
import type { ValidationError } from "../../domain/errors/validation.error.js";

/**
 * Builder for Responsavel entity
 * Provides fluent interface for creating test guardians
 */
export class ResponsavelBuilder {
	private props: CriarResponsavelDTO = {
		id: 1,
		nome: VALID_NAMES.SIMPLE,
		cpf: VALID_CPFS.CPF_2,
		telefone: VALID_PHONES.MOBILE_SP,
		email: VALID_EMAILS.EMAIL_1,
		dataDeNascimento: TEST_DATES.RESPONSIBLE_AGE_40,
		escolaId: 1,
	};

	withId(id: number): this {
		this.props = { ...this.props, id };
		return this;
	}

	withNome(nome: string): this {
		this.props = { ...this.props, nome };
		return this;
	}

	withCpf(cpf: string): this {
		this.props = { ...this.props, cpf };
		return this;
	}

	withTelefone(telefone: string): this {
		this.props = { ...this.props, telefone };
		return this;
	}

	withEmail(email: string): this {
		this.props = { ...this.props, email };
		return this;
	}

	withDataDeNascimento(dataDeNascimento: Date): this {
		this.props = { ...this.props, dataDeNascimento };
		return this;
	}

	withIdade(anos: number): this {
		const hoje = new Date();
		this.props = {
			...this.props,
			dataDeNascimento: new Date(hoje.getFullYear() - anos, hoje.getMonth(), hoje.getDate()),
		};
		return this;
	}

	withEscolaId(escolaId: number): this {
		this.props = { ...this.props, escolaId };
		return this;
	}

	build(): Result<Responsavel, ValidationError> {
		return Responsavel.criar(this.props);
	}

	buildValid(): Responsavel {
		const result = Responsavel.criar(this.props);
		if (result.type === "erro") {
			throw new Error(`Failed to create valid Responsavel: ${JSON.stringify(result.erro)}`);
		}
		return result.value;
	}

	buildReconstituted(): Responsavel {
		return Responsavel.reconstituir(this.props);
	}
}

/**
 * Builder for Colaborador entity
 * Provides fluent interface for creating test employees
 */
export class ColaboradorBuilder {
	private props: CriarColaboradorDTO = {
		id: 1,
		nome: VALID_NAMES.WITH_ACCENTS,
		cpf: VALID_CPFS.CPF_3,
		email: VALID_EMAILS.EMAIL_2,
		escolaId: 1,
		usuario: {
			id: 1,
			email: VALID_EMAILS.EMAIL_2,
		},
	};

	withId(id: number): this {
		this.props = { ...this.props, id };
		return this;
	}

	withNome(nome: string): this {
		this.props = { ...this.props, nome };
		return this;
	}

	withCpf(cpf: string): this {
		this.props = { ...this.props, cpf };
		return this;
	}

	withEmail(email: string): this {
		this.props = { ...this.props, email, usuario: { ...this.props.usuario, email } };
		return this;
	}

	withEscolaId(escolaId: number): this {
		this.props = { ...this.props, escolaId };
		return this;
	}

	withUsuarioId(usuarioId: number): this {
		this.props = { ...this.props, usuario: { ...this.props.usuario, id: usuarioId } };
		return this;
	}

	build(): Result<Colaborador, ValidationError> {
		return Colaborador.criar(this.props);
	}

	buildValid(): Colaborador {
		const result = Colaborador.criar(this.props);
		if (result.type === "erro") {
			throw new Error(`Failed to create valid Colaborador: ${JSON.stringify(result.erro)}`);
		}
		return result.value;
	}

	buildReconstituted(): Colaborador {
		return Colaborador.reconstituir(this.props);
	}
}

/**
 * Builder for ContratoComum entity
 * Provides fluent interface for creating test regular contracts
 */
export class ContratoComumBuilder {
	private props: CriarContratoComumDTO = {
		id: 1,
		dataInicio: TEST_DATES.CONTRACT_START,
		dataFim: TEST_DATES.CONTRACT_END,
		cargoId: 1,
		unidadeId: 1,
		matricula: "COL001",
		status: StatusContratoEnum.Ativo,
		salario: TEST_MONEY.COORDINATOR_SALARY,
	};

	withId(id: number): this {
		this.props = { ...this.props, id };
		return this;
	}

	withDataInicio(dataInicio: Date): this {
		this.props = { ...this.props, dataInicio };
		return this;
	}

	withDataFim(dataFim: Date | null): this {
		this.props = { ...this.props, dataFim };
		return this;
	}

	withCargoId(cargoId: number): this {
		this.props = { ...this.props, cargoId };
		return this;
	}

	withUnidadeId(unidadeId: number): this {
		this.props = { ...this.props, unidadeId };
		return this;
	}

	withMatricula(matricula: string): this {
		this.props = { ...this.props, matricula };
		return this;
	}

	withStatus(status: StatusContrato): this {
		this.props = { ...this.props, status };
		return this;
	}

	withSalario(salario: number): this {
		this.props = { ...this.props, salario };
		return this;
	}

	withAtivo(): this {
		this.props = { ...this.props, status: StatusContratoEnum.Ativo };
		return this;
	}

	withInativo(): this {
		this.props = { ...this.props, status: StatusContratoEnum.Inativo };
		return this;
	}

	build(): Result<ContratoComum, ValidationError> {
		return ContratoComum.criar(this.props);
	}

	buildValid(): ContratoComum {
		const result = ContratoComum.criar(this.props);
		if (result.type === "erro") {
			throw new Error(`Failed to create valid ContratoComum: ${JSON.stringify(result.erro)}`);
		}
		return result.value;
	}

	buildReconstituted(): ContratoComum {
		return ContratoComum.reconstituir({ ...this.props, dataFim: this.props.dataFim ?? null });
	}
}

/**
 * Builder for ContratoProfessor entity
 * Provides fluent interface for creating test teacher contracts
 */
export class ContratoProfessorBuilder {
	private props: CriarContratoProfessorDTO = {
		id: 1,
		dataInicio: TEST_DATES.CONTRACT_START,
		dataFim: TEST_DATES.CONTRACT_END,
		cargoId: 1,
		unidadeId: 1,
		matricula: "PROF001",
		status: StatusContratoEnum.Ativo,
		salario: TEST_MONEY.TEACHER_SALARY,
		disciplinas: [
			{ disciplinaId: 1, etapaId: 1 },
			{ disciplinaId: 2, etapaId: 1 },
		],
	};

	withId(id: number): this {
		this.props = { ...this.props, id };
		return this;
	}

	withDataInicio(dataInicio: Date): this {
		this.props = { ...this.props, dataInicio };
		return this;
	}

	withDataFim(dataFim: Date | null): this {
		this.props = { ...this.props, dataFim };
		return this;
	}

	withCargoId(cargoId: number): this {
		this.props = { ...this.props, cargoId };
		return this;
	}

	withUnidadeId(unidadeId: number): this {
		this.props = { ...this.props, unidadeId };
		return this;
	}

	withMatricula(matricula: string): this {
		this.props = { ...this.props, matricula };
		return this;
	}

	withStatus(status: StatusContrato): this {
		this.props = { ...this.props, status };
		return this;
	}

	withSalario(salario: number): this {
		this.props = { ...this.props, salario };
		return this;
	}

	withDisciplinas(disciplinas: { readonly disciplinaId: number; readonly etapaId: number }[]): this {
		this.props = { ...this.props, disciplinas };
		return this;
	}

	withAtivo(): this {
		this.props = { ...this.props, status: StatusContratoEnum.Ativo };
		return this;
	}

	withInativo(): this {
		this.props = { ...this.props, status: StatusContratoEnum.Inativo };
		return this;
	}

	build(): Result<ContratoProfessor, ValidationError> {
		return ContratoProfessor.criar(this.props);
	}

	buildValid(): ContratoProfessor {
		const result = ContratoProfessor.criar(this.props);
		if (result.type === "erro") {
			throw new Error(`Failed to create valid ContratoProfessor: ${JSON.stringify(result.erro)}`);
		}
		return result.value;
	}

	buildReconstituted(): ContratoProfessor {
		return ContratoProfessor.reconstituir({ ...this.props, dataFim: this.props.dataFim ?? null });
	}
}

/**
 * Builder for Matricula entity
 * Provides fluent interface for creating test enrollments
 */
export class MatriculaBuilder {
	private props: CriarMatriculaDTO = {
		id: 1,
		unidadeId: 1,
		estudanteId: 1,
		periodoLetivoId: 1,
		status: StatusMatriculaEnum.Ativa,
		dataCriacao: TEST_DATES.TODAY,
		comprovanteResidenciaId: 1,
		historicoEscolarId: 1,
	};

	withId(id: number): this {
		this.props = { ...this.props, id };
		return this;
	}

	withUnidadeId(unidadeId: number): this {
		this.props = { ...this.props, unidadeId };
		return this;
	}

	withEstudanteId(estudanteId: number): this {
		this.props = { ...this.props, estudanteId };
		return this;
	}

	withPeriodoLetivoId(periodoLetivoId: number): this {
		this.props = { ...this.props, periodoLetivoId };
		return this;
	}

	withStatus(status: StatusMatricula): this {
		this.props = { ...this.props, status };
		return this;
	}

	withDataCriacao(dataCriacao: Date): this {
		this.props = { ...this.props, dataCriacao };
		return this;
	}

	withComprovanteResidenciaId(comprovanteResidenciaId: number): this {
		this.props = { ...this.props, comprovanteResidenciaId };
		return this;
	}

	withHistoricoEscolarId(historicoEscolarId: number): this {
		this.props = { ...this.props, historicoEscolarId };
		return this;
	}

	withAtiva(): this {
		this.props = { ...this.props, status: StatusMatriculaEnum.Ativa };
		return this;
	}

	withInativa(): this {
		this.props = { ...this.props, status: StatusMatriculaEnum.Inativa };
		return this;
	}

	withCancelada(): this {
		this.props = { ...this.props, status: StatusMatriculaEnum.Cancelada };
		return this;
	}

	build(): Result<Matricula, ValidationError> {
		return Matricula.criar(this.props);
	}

	buildValid(): Matricula {
		const result = Matricula.criar(this.props);
		if (result.type === "erro") {
			throw new Error(`Failed to create valid Matricula: ${JSON.stringify(result.erro)}`);
		}
		return result.value;
	}

	buildReconstituted(): Matricula {
		return Matricula.reconstituir({
			...this.props,
			dataCriacao: this.props.dataCriacao ?? TEST_DATES.TODAY,
			status: this.props.status ?? StatusMatriculaEnum.Ativa,
		});
	}
}

/**
 * Builder for Turma entity
 * Provides fluent interface for creating test classes
 */
export class TurmaBuilder {
	private props: {
		id: number;
		anoLetivoId: number;
		letra: string;
		baseId: number;
		modalidadeId: number;
		etapaId: number;
		limiteDeAlunos: number;
		unidadeId: number;
	} = {
		id: 1,
		anoLetivoId: 1,
		letra: "A",
		baseId: 1,
		modalidadeId: 1,
		etapaId: 1,
		limiteDeAlunos: 30,
		unidadeId: 1,
	};

	withId(id: number): this {
		this.props = { ...this.props, id };
		return this;
	}

	withAnoLetivoId(anoLetivoId: number): this {
		this.props = { ...this.props, anoLetivoId };
		return this;
	}

	withLetra(letra: string): this {
		this.props = { ...this.props, letra };
		return this;
	}

	withBaseId(baseId: number): this {
		this.props = { ...this.props, baseId };
		return this;
	}

	withModalidadeId(modalidadeId: number): this {
		this.props = { ...this.props, modalidadeId };
		return this;
	}

	withEtapaId(etapaId: number): this {
		this.props = { ...this.props, etapaId };
		return this;
	}

	withLimiteDeAlunos(limiteDeAlunos: number): this {
		this.props = { ...this.props, limiteDeAlunos };
		return this;
	}

	withUnidadeId(unidadeId: number): this {
		this.props = { ...this.props, unidadeId };
		return this;
	}

	build(): Result<Turma, ValidationError> {
		return Turma.criar(this.props);
	}

	buildValid(): Turma {
		const result = Turma.criar(this.props);
		if (result.type === "erro") {
			throw new Error(`Failed to create valid Turma: ${JSON.stringify(result.erro)}`);
		}
		return result.value;
	}

	buildReconstituted(): Turma {
		return Turma.reconstituir(this.props);
	}
}
