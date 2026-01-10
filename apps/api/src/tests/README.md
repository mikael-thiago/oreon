# Test Infrastructure

This directory contains test utilities and infrastructure for the Oreon API test suite.

## Overview

The test infrastructure provides:

- **Custom Vitest matchers** for Result pattern assertions
- **Test data constants** with valid Brazilian CPFs, emails, phones, etc.
- **Builder patterns** for value objects and entities
- **Mock services** for infrastructure dependencies
- **In-memory repositories** for testing without a database

## Directory Structure

```
tests/
├── helpers/           # Test utilities and helpers
│   ├── result-matchers.ts        # Custom Vitest matchers
│   ├── test-data.ts              # Valid test data constants
│   ├── value-object-builders.ts  # Builders for VOs
│   ├── entity-builders.ts        # Builders for entities
│   ├── mock-services.ts          # Mock service implementations
│   ├── mock-repositories.ts      # In-memory repositories
│   └── index.ts                  # Exports all helpers
├── examples/          # Example test files
│   └── example.test.ts           # Usage examples
└── README.md          # This file
```

## Custom Result Matchers

The test infrastructure provides custom Vitest matchers for the Result pattern:

### toBeOk()

Asserts that a Result is successful (Ok).

```typescript
const result = CPF.criar("529.982.247-25");
expect(result).toBeOk();
```

### toBeFailure()

Asserts that a Result is a failure.

```typescript
const result = CPF.criar("invalid");
expect(result).toBeFailure();
```

### toBeFailureWith(ErrorClass)

Asserts that a Result is a failure AND the error is an instance of the specified class.

```typescript
const result = CPF.criar("invalid");
expect(result).toBeFailureWith(ValidationError);
```

## Test Data Constants

All test data is centralized in `test-data.ts`:

### Valid CPFs

```typescript
import { VALID_CPFS } from "./helpers/test-data.js";

VALID_CPFS.CPF_1; // "529.982.247-25"
VALID_CPFS.CPF_2; // "111.444.777-35"
VALID_CPFS.CPF_3; // "123.456.789-09"
```

### Valid Emails

```typescript
import { VALID_EMAILS } from "./helpers/test-data.js";

VALID_EMAILS.EMAIL_1; // "joao.silva@example.com"
VALID_EMAILS.EMAIL_2; // "maria.santos@escola.edu.br"
```

### Valid Phone Numbers

```typescript
import { VALID_PHONES } from "./helpers/test-data.js";

VALID_PHONES.MOBILE_SP; // "(11) 98765-4321"
VALID_PHONES.LANDLINE_SP; // "(11) 3456-7890"
```

### Test Dates

```typescript
import { TEST_DATES } from "./helpers/test-data.js";

TEST_DATES.STUDENT_AGE_10; // Birth date for 10-year-old student
TEST_DATES.RESPONSIBLE_AGE_40; // Birth date for 40-year-old responsible
```

### Test Monetary Values

```typescript
import { TEST_MONEY } from "./helpers/test-data.js";

TEST_MONEY.TEACHER_SALARY; // 5000.0
TEST_MONEY.MINIMUM_WAGE; // 1412.0
```

## Value Object Builders

Builders provide a fluent interface for creating value objects:

### CPFBuilder

```typescript
import { CPFBuilder, VALID_CPFS } from "./helpers/index.js";

// Build and get Result
const cpfResult = new CPFBuilder().withValor(VALID_CPFS.CPF_1).build();

// Build valid VO (throws if invalid)
const cpf = new CPFBuilder().withValor(VALID_CPFS.CPF_1).buildValid();

// Build reconstituted VO (no validation)
const cpf = new CPFBuilder().withValor(VALID_CPFS.CPF_1).buildReconstituted();
```

### EmailBuilder

```typescript
const email = new EmailBuilder().withValor("test@example.com").buildValid();
```

### TelefoneBuilder

```typescript
const telefone = new TelefoneBuilder()
	.withMobile() // Use mobile phone
	.buildValid();
```

### NomeBuilder

```typescript
const nome = new NomeBuilder().withValor("Maria Silva Santos").buildValid();
```

### DinheiroBuilder

```typescript
const salario = new DinheiroBuilder()
	.withSalarioProfessor() // Use teacher salary
	.buildValid();

const zero = new DinheiroBuilder().buildZero();
```

## Entity Builders

Builders for creating test entities with sensible defaults:

### AlunoBuilder

```typescript
import { AlunoBuilder } from "./helpers/index.js";

const aluno = new AlunoBuilder()
	.withNome("Maria Silva Santos")
	.withCpf("529.982.247-25")
	.withIdade(10)
	.buildValid();
```

### ResponsavelBuilder

```typescript
const responsavel = new ResponsavelBuilder()
	.withNome("José da Silva")
	.withEmail("jose@example.com")
	.withIdade(40)
	.buildValid();
```

### ColaboradorBuilder

```typescript
const colaborador = new ColaboradorBuilder()
	.withNome("Professor João")
	.withEmail("professor@escola.com")
	.buildValid();
```

### ContratoComumBuilder

```typescript
const contrato = new ContratoComumBuilder()
	.withSalario(8000.0)
	.withAtivo()
	.buildValid();
```

### ContratoProfessorBuilder

```typescript
const contrato = new ContratoProfessorBuilder()
	.withSalario(5000.0)
	.withDisciplinas([
		{ disciplinaId: 1, etapaId: 1 },
		{ disciplinaId: 2, etapaId: 1 },
	])
	.buildValid();
```

### MatriculaBuilder

```typescript
const matricula = new MatriculaBuilder().withEstudanteId(1).withAtiva().buildValid();
```

### TurmaBuilder

```typescript
const turma = new TurmaBuilder().withLetra("A").withLimiteDeAlunos(30).buildValid();
```

## Mock Services

Mock implementations of infrastructure services:

### MockCriptografiaService

```typescript
import { MockCriptografiaService } from "./helpers/index.js";

const cryptoService = new MockCriptografiaService();

const hash = await cryptoService.hashear("senha123");
// Returns: "hashed_senha123"

const isValid = await cryptoService.verificar(hash, "senha123");
// Returns: true
```

### MockFileStorageService

```typescript
import { MockFileStorageService } from "./helpers/index.js";

const fileService = new MockFileStorageService();

const result = await fileService.uploadFile({
	fileName: "document.pdf",
	content: Buffer.from("..."),
});
// Returns: { url: "http://...", path: "uploads/..." }

// Test helpers
fileService.hasFile(result.path); // true
fileService.clear(); // Clear all files
```

### MockJWTService

```typescript
import { MockJWTService } from "./helpers/index.js";

const jwtService = new MockJWTService();

const token = jwtService.sign({ userId: 1 });
const payload = jwtService.verify(token);
// Returns: { userId: 1 }
```

## In-Memory Repositories

Smart mock repositories that implement real search logic:

### InMemoryAlunoRepository

```typescript
import { InMemoryAlunoRepository } from "./helpers/index.js";

const repository = new InMemoryAlunoRepository();

// Use like a real repository
const id = await repository.obterProximoId();
const aluno = new AlunoBuilder().withId(id).buildReconstituted();
await repository.salvar(aluno);

const found = await repository.obterAlunoPorCpf(aluno.cpfValor);

// Test helpers
repository.reset(); // Clear all data
repository.seed([aluno1, aluno2]); // Add test data
const all = repository.getAll(); // Get all entities
```

### Available Repositories

- `InMemoryAlunoRepository`
- `InMemoryResponsavelRepository`
- `InMemoryUsuarioRepository`
- `InMemoryColaboradorRepository`
- `InMemoryContratoRepository`
- `InMemoryMatriculaRepository`
- `InMemoryUnidadeEscolarRepository`
- `InMemoryAnoLetivoRepository`
- `InMemoryCargoRepository`
- `InMemoryTurmaRepository`

All repositories have the same test helper methods:

- `reset()` - Clear all data
- `seed(entities)` - Seed with test data
- `getAll()` - Get all entities

## Usage Examples

### Simple Unit Test

```typescript
import { describe, it, expect } from "vitest";
import { CPFBuilder, VALID_CPFS } from "./helpers/index.js";

describe("CPF Value Object", () => {
	it("should create valid CPF", () => {
		const result = new CPFBuilder().withValor(VALID_CPFS.CPF_1).build();

		expect(result).toBeOk();
	});
});
```

### Testing Entity Creation

```typescript
import { describe, it, expect } from "vitest";
import { AlunoBuilder, VALID_CPFS } from "./helpers/index.js";

describe("Aluno Entity", () => {
	it("should create valid student", () => {
		const aluno = new AlunoBuilder().withCpf(VALID_CPFS.CPF_1).withIdade(10).buildValid();

		expect(aluno.podeSerMatriculado()).toBe(true);
	});

	it("should reject student too young", () => {
		const result = new AlunoBuilder().withIdade(1).build();

		expect(result).toBeFailure();
	});
});
```

### Integration Test with Repository

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { AlunoBuilder, InMemoryAlunoRepository, VALID_CPFS } from "./helpers/index.js";

describe("Aluno Use Cases", () => {
	let repository: InMemoryAlunoRepository;

	beforeEach(() => {
		repository = new InMemoryAlunoRepository();
	});

	it("should save and retrieve student", async () => {
		const id = await repository.obterProximoId();
		const aluno = new AlunoBuilder().withId(id).withCpf(VALID_CPFS.CPF_1).buildReconstituted();

		await repository.salvar(aluno);

		const found = await repository.obterAlunoPorCpf(aluno.cpfValor);
		expect(found).not.toBeNull();
		expect(found?.id).toBe(id);
	});
});
```

## Best Practices

### 1. Use Builders for Test Data

Always use builders instead of constructing entities manually:

```typescript
// Good
const aluno = new AlunoBuilder().withIdade(10).buildValid();

// Bad
const aluno = Aluno.criar({
	id: 1,
	nome: "Test",
	cpf: "12345678900",
	dataDeNascimento: new Date(),
	sexo: "feminino",
	escolaId: 1,
});
```

### 2. Reset Repositories in beforeEach

```typescript
beforeEach(() => {
	repository.reset();
});
```

### 3. Use Test Data Constants

```typescript
// Good
const cpf = VALID_CPFS.CPF_1;

// Bad
const cpf = "529.982.247-25";
```

### 4. Use Custom Matchers for Results

```typescript
// Good
expect(result).toBeOk();

// Bad
expect(result.type).toBe("sucesso");
```

### 5. Test Both Success and Failure Cases

```typescript
it("should create valid entity", () => {
	const result = new EntityBuilder().build();
	expect(result).toBeOk();
});

it("should fail with invalid data", () => {
	const result = new EntityBuilder().withInvalidData().build();
	expect(result).toBeFailure();
});
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- path/to/test.test.ts

# Run with coverage
npm test -- --coverage
```

## See Also

- [Example test file](./examples/example.test.ts) - Complete usage examples
- [Vitest documentation](https://vitest.dev/)
- [Testing best practices](./.claude/rules/api/testing.md)
