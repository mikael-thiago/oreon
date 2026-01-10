/**
 * Valid test data constants for testing
 * All CPFs, emails, phones are valid according to business rules
 */

/**
 * Valid Brazilian CPFs (validated by CPF algorithm)
 */
export const VALID_CPFS = {
	CPF_1: "529.982.247-25",
	CPF_2: "111.444.777-35",
	CPF_3: "123.456.789-09",
	CPF_4: "987.654.321-00",
	CPF_5: "000.000.001-91",
} as const;

/**
 * Valid Brazilian CPFs (unformatted)
 */
export const VALID_CPFS_UNFORMATTED = {
	CPF_1: "52998224725",
	CPF_2: "11144477735",
	CPF_3: "12345678909",
	CPF_4: "98765432100",
	CPF_5: "00000000191",
} as const;

/**
 * Invalid CPFs for negative testing
 */
export const INVALID_CPFS = {
	INVALID_CHECKSUM: "123.456.789-00",
	ALL_SAME_DIGITS: "111.111.111-11",
	EMPTY: "",
	TOO_SHORT: "123.456",
	WITH_LETTERS: "abc.def.ghi-jk",
} as const;

/**
 * Valid email addresses
 */
export const VALID_EMAILS = {
	EMAIL_1: "joao.silva@example.com",
	EMAIL_2: "maria.santos@escola.edu.br",
	EMAIL_3: "professor@oreon.com.br",
	EMAIL_4: "admin@test.org",
	EMAIL_5: "aluno123@gmail.com",
} as const;

/**
 * Invalid emails for negative testing
 */
export const INVALID_EMAILS = {
	NO_AT: "emailsemarroba.com",
	NO_DOMAIN: "email@",
	NO_TLD: "email@domain",
	SPACES: "email @domain.com",
	EMPTY: "",
} as const;

/**
 * Valid Brazilian phone numbers
 */
export const VALID_PHONES = {
	// Mobile phones (11 digits)
	MOBILE_SP: "(11) 98765-4321", // São Paulo
	MOBILE_RJ: "(21) 99876-5432", // Rio de Janeiro
	MOBILE_MG: "(31) 97654-3210", // Minas Gerais

	// Landline phones (10 digits)
	LANDLINE_SP: "(11) 3456-7890", // São Paulo
	LANDLINE_RJ: "(21) 2345-6789", // Rio de Janeiro
	LANDLINE_MG: "(31) 3234-5678", // Minas Gerais

	// Without formatting
	MOBILE_UNFORMATTED: "11987654321",
	LANDLINE_UNFORMATTED: "1134567890",
} as const;

/**
 * Invalid phones for negative testing
 */
export const INVALID_PHONES = {
	TOO_SHORT: "1234567",
	TOO_LONG: "123456789012",
	WITH_LETTERS: "11 9abcd-efgh",
	EMPTY: "",
} as const;

/**
 * Valid person names
 */
export const VALID_NAMES = {
	FULL_NAME: "Maria Silva Santos",
	WITH_ACCENTS: "José da Conceição",
	WITH_HYPHEN: "Ana-Paula Costa",
	WITH_APOSTROPHE: "D'Angelo Oliveira",
	SIMPLE: "João Silva",
	LONG: "Pedro Henrique de Almeida Ferreira da Silva Júnior",
} as const;

/**
 * Invalid names for negative testing
 */
export const INVALID_NAMES = {
	TOO_SHORT: "A",
	EMPTY: "",
	WITH_NUMBERS: "João123",
	WITH_SPECIAL_CHARS: "João@Silva",
} as const;

/**
 * Test dates
 */
export const TEST_DATES = {
	// Birth dates for students (ages 3-18)
	STUDENT_AGE_5: new Date(new Date().getFullYear() - 5, 0, 15), // 5 years old
	STUDENT_AGE_10: new Date(new Date().getFullYear() - 10, 5, 20), // 10 years old
	STUDENT_AGE_15: new Date(new Date().getFullYear() - 15, 11, 10), // 15 years old

	// Birth dates for responsibles (ages 18+)
	RESPONSIBLE_AGE_25: new Date(new Date().getFullYear() - 25, 2, 15), // 25 years old
	RESPONSIBLE_AGE_40: new Date(new Date().getFullYear() - 40, 7, 20), // 40 years old
	RESPONSIBLE_AGE_50: new Date(new Date().getFullYear() - 50, 10, 5), // 50 years old

	// Contract dates
	CONTRACT_START: new Date(new Date().getFullYear(), 0, 1), // Start of current year
	CONTRACT_END: new Date(new Date().getFullYear(), 11, 31), // End of current year

	// School year dates
	SCHOOL_YEAR_START: new Date(new Date().getFullYear(), 1, 1), // February 1
	SCHOOL_YEAR_END: new Date(new Date().getFullYear(), 11, 15), // December 15

	// Generic dates
	TODAY: new Date(),
	YESTERDAY: new Date(Date.now() - 24 * 60 * 60 * 1000),
	TOMORROW: new Date(Date.now() + 24 * 60 * 60 * 1000),
	LAST_YEAR: new Date(new Date().getFullYear() - 1, 0, 1),
	NEXT_YEAR: new Date(new Date().getFullYear() + 1, 0, 1),
} as const;

/**
 * Test monetary values
 */
export const TEST_MONEY = {
	ZERO: 0,
	MINIMUM_WAGE: 1412.0, // Brazilian minimum wage (approximate)
	TEACHER_SALARY: 5000.0,
	COORDINATOR_SALARY: 8000.0,
	DIRECTOR_SALARY: 12000.0,
	TUITION_FEE: 1500.5,
	REGISTRATION_FEE: 300.0,
} as const;
