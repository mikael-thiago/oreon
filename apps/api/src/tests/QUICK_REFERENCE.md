# Test Infrastructure Quick Reference

## Import Pattern

```typescript
import {
	// Matchers (auto-loaded via vitest)
	// Custom assertions available on expect()

	// Test Data
	VALID_CPFS,
	VALID_EMAILS,
	VALID_PHONES,
	VALID_NAMES,
	TEST_DATES,
	TEST_MONEY,
	TEST_IDS,

	// Value Object Builders
	CPFBuilder,
	EmailBuilder,
	TelefoneBuilder,
	NomeBuilder,
	DinheiroBuilder,

	// Entity Builders
	AlunoBuilder,
	ResponsavelBuilder,
	ColaboradorBuilder,
	ContratoComumBuilder,
	ContratoProfessorBuilder,
	MatriculaBuilder,
	TurmaBuilder,

	// Mock Services
	MockCriptografiaService,
	MockFileStorageService,
	MockJWTService,

	// Mock Repositories
	InMemoryAlunoRepository,
	InMemoryResponsavelRepository,
	InMemoryUsuarioRepository,
	InMemoryColaboradorRepository,
	InMemoryContratoRepository,
	InMemoryMatriculaRepository,
	InMemoryUnidadeEscolarRepository,
	InMemoryAnoLetivoRepository,
	InMemoryCargoRepository,
	InMemoryTurmaRepository,
} from "./helpers/index.js";
```

## Custom Matchers

```typescript
// Result is Ok
expect(result).toBeOk();

// Result is Failure
expect(result).toBeFailure();

// Result is Failure with specific error type
expect(result).toBeFailureWith(ValidationError);
```

## Value Object Builders

```typescript
// CPF
const cpf = new CPFBuilder().withValor(VALID_CPFS.CPF_1).buildValid();

// Email
const email = new EmailBuilder().withValor("test@example.com").buildValid();

// Telefone
const telefone = new TelefoneBuilder().withMobile().buildValid();

// Nome
const nome = new NomeBuilder().withValor("Maria Silva").buildValid();

// Dinheiro
const salario = new DinheiroBuilder().withSalarioProfessor().buildValid();
```

## Entity Builders

```typescript
// Aluno
const aluno = new AlunoBuilder()
	.withNome("Maria Santos")
	.withCpf(VALID_CPFS.CPF_1)
	.withIdade(10)
	.buildValid();

// Responsavel
const responsavel = new ResponsavelBuilder()
	.withEmail(VALID_EMAILS.EMAIL_1)
	.withIdade(40)
	.buildValid();

// Colaborador
const colaborador = new ColaboradorBuilder().withEmail(VALID_EMAILS.EMAIL_2).buildValid();

// ContratoComum
const contrato = new ContratoComumBuilder().withSalario(8000).withAtivo().buildValid();

// ContratoProfessor
const contrato = new ContratoProfessorBuilder()
	.withDisciplinas([
		{ disciplinaId: 1, etapaId: 1 },
		{ disciplinaId: 2, etapaId: 1 },
	])
	.buildValid();

// Matricula
const matricula = new MatriculaBuilder().withEstudanteId(1).withAtiva().buildValid();

// Turma
const turma = new TurmaBuilder().withLetra("A").withLimiteDeAlunos(30).buildValid();
```

## Builder Methods

All builders support:

```typescript
// Returns Result<T, ValidationError> - test validation
builder.build();

// Returns T - throws if invalid (for valid test cases)
builder.buildValid();

// Returns T - no validation (for reconstituted entities)
builder.buildReconstituted();
```

## Mock Repositories

```typescript
// Setup
const repository = new InMemoryAlunoRepository();

// Use like real repository
const id = await repository.obterProximoId();
await repository.salvar(entity);
const found = await repository.obterAlunoPorCpf(cpf);

// Test helpers
repository.reset(); // Clear all data
repository.seed([entity1, entity2]); // Add test data
const all = repository.getAll(); // Get all entities
```

## Mock Services

```typescript
// Criptografia
const crypto = new MockCriptografiaService();
const hash = await crypto.hashear("password"); // "hashed_password"
const valid = await crypto.verificar(hash, "password"); // true

// File Storage
const storage = new MockFileStorageService();
const result = await storage.uploadFile({
	fileName: "doc.pdf",
	content: Buffer.from("..."),
});
storage.hasFile(result.path); // true
storage.clear(); // Clear all files

// JWT
const jwt = new MockJWTService();
const token = jwt.sign({ userId: 1 });
const payload = jwt.verify(token); // { userId: 1 }
```

## Test Template

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { EntityBuilder, InMemoryEntityRepository, VALID_CPFS } from "../helpers/index.js";

describe("Feature Name", () => {
	let repository: InMemoryEntityRepository;

	beforeEach(() => {
		repository = new InMemoryEntityRepository();
	});

	it("should do something", async () => {
		// Arrange
		const entity = new EntityBuilder().withSomething(value).buildValid();

		// Act
		await repository.salvar(entity);

		// Assert
		const found = await repository.obterPorId(entity.id);
		expect(found).not.toBeNull();
	});

	it("should fail when invalid", () => {
		// Arrange & Act
		const result = new EntityBuilder().withInvalidData().build();

		// Assert
		expect(result).toBeFailure();
		expect(result).toBeFailureWith(ValidationError);
	});
});
```

## Common Patterns

### Test Success Case

```typescript
it("should create valid entity", () => {
	const entity = new EntityBuilder().buildValid();
	expect(entity.someProperty).toBe(expectedValue);
});
```

### Test Failure Case

```typescript
it("should reject invalid data", () => {
	const result = new EntityBuilder().withInvalidData().build();
	expect(result).toBeFailure();
});
```

### Test Repository

```typescript
it("should save and retrieve", async () => {
	const entity = new EntityBuilder().buildReconstituted();
	await repository.salvar(entity);

	const found = await repository.obterPorId(entity.id);
	expect(found).not.toBeNull();
});
```

### Test Business Rule

```typescript
it("should enforce business rule", () => {
	const entity = new EntityBuilder().buildValid();
	expect(entity.someBusinessRule()).toBe(true);
});
```

## Test Data Constants

```typescript
// CPFs
VALID_CPFS.CPF_1; // "529.982.247-25"
VALID_CPFS.CPF_2; // "111.444.777-35"

// Emails
VALID_EMAILS.EMAIL_1; // "joao.silva@example.com"

// Phones
VALID_PHONES.MOBILE_SP; // "(11) 98765-4321"

// Names
VALID_NAMES.FULL_NAME; // "Maria Silva Santos"

// Dates
TEST_DATES.STUDENT_AGE_10; // Birth date for 10-year-old
TEST_DATES.RESPONSIBLE_AGE_40; // Birth date for 40-year-old

// Money
TEST_MONEY.TEACHER_SALARY; // 5000.0

// IDs
TEST_IDS.ESCOLA_ID; // 1
TEST_IDS.UNIDADE_ID; // 1
```

## Run Tests

```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# Specific file
npm test -- path/to/test.test.ts

# Coverage
npm test -- --coverage
```
