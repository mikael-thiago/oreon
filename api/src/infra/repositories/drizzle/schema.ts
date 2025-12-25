import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

export const modalidadeTable = pgTable("modalities", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar({ length: 20 }).notNull(),
});

export const etapaTable = pgTable("steps", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  sortOrder: integer().notNull(),
  name: varchar({ length: 50 }).notNull(),
  modalityId: integer()
    .notNull()
    .references(() => modalidadeTable.id),
});

export const modalidadeRelations = relations(modalidadeTable, ({ many }) => ({
  etapas: many(etapaTable),
}));

export const etapaRelations = relations(etapaTable, ({ one, many }) => ({
  modalidade: one(modalidadeTable, {
    fields: [etapaTable.modalityId],
    references: [modalidadeTable.id],
  }),
  modalidades: many(baseCurricularTable),
}));

export const escolaTable = pgTable("institutions", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar({ length: 100 }).notNull(),
  email: varchar({ length: 100 }).notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const unidadeTable = pgTable("institution_unit", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  cnpj: varchar({ length: 14 }).notNull().unique(),
  phone1: varchar({ length: 20 }).notNull(),
  phone2: varchar({ length: 20 }),
  street: varchar({ length: 150 }),
  number: varchar({ length: 10 }),
  city: varchar({ length: 100 }),
  state: varchar({ length: 2 }),
  zipCode: varchar({ length: 15 }),
  country: varchar({ length: 50 }).default("Brasil"),
  isHeadQuarter: boolean().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  institutionId: integer()
    .notNull()
    .references(() => escolaTable.id),
});

export const escolaRelations = relations(escolaTable, ({ many }) => ({
  unidades: many(unidadeTable),
}));

export const baseCurricularTable = pgTable("base_classes", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  code: varchar({ length: 12 }).notNull(),
  stepId: integer().notNull(),
  unitId: integer("institution_unit_id")
    .notNull()
    .references(() => escolaTable.id),
  creationDate: timestamp().notNull().defaultNow(),
});

export const baseRelations = relations(baseCurricularTable, ({ one }) => ({
  etapa: one(etapaTable, {
    fields: [baseCurricularTable.stepId],
    references: [etapaTable.id],
  }),
  unidade: one(unidadeTable, {
    fields: [baseCurricularTable.unitId],
    references: [unidadeTable.id],
  }),
}));

export const disciplinasTable = pgTable(
  "disciplines",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    name: varchar({ length: 50 }).notNull(),
    slug: varchar({ length: 50 }).notNull(),
    unitId: integer().references(() => unidadeTable.id),
  },
  (table) => [unique("school_id_slug_unique_idx").on(table.unitId, table.slug)]
);

export const baseDisciplinaTable = pgTable(
  "base_class_discipline",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    disciplineId: integer()
      .notNull()
      .references(() => disciplinasTable.id),
    baseId: integer()
      .notNull()
      .references(() => baseCurricularTable.id),
    code: varchar({ length: 10 }).notNull(),
    annual_workload: integer().notNull(),
  },
  (table) => [unique("base_class_discipline_discipline_id_base_id_unique_idx").on(table.disciplineId, table.baseId)]
);

export const usuarioTable = pgTable("users", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar({ length: 100 }).notNull(),
  cpf: varchar({ length: 11 }).unique(),
  email: varchar({ length: 100 }).notNull().unique(),
  login: varchar({ length: 100 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  phone: varchar({ length: 20 }),
  escolaId: integer("school_id").references(() => escolaTable.id),
  createdAt: timestamp().notNull().defaultNow(),
  isAdmin: boolean().notNull().default(false),
  isRoot: boolean().notNull().default(false),
});

export const usuarioRelations = relations(usuarioTable, ({ one }) => ({
  escola: one(escolaTable, {
    fields: [usuarioTable.escolaId],
    references: [escolaTable.id],
  }),
}));

export const anoLetivoTable = pgTable("school_periods", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  year: integer().notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  schoolId: integer("school_id")
    .notNull()
    .references(() => escolaTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const anoLetivoRelations = relations(anoLetivoTable, ({ one }) => ({
  escola: one(escolaTable, {
    fields: [anoLetivoTable.schoolId],
    references: [escolaTable.id],
  }),
}));

export const shiftsEnum = pgEnum("shifts", ["day", "afternoom", "night"]);

export const turmaTable = pgTable("classes", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  unitId: integer("institution_unit_id")
    .notNull()
    .references(() => unidadeTable.id),
  modalityId: integer()
    .notNull()
    .references(() => modalidadeTable.id),
  etapaId: integer("step_id")
    .notNull()
    .references(() => etapaTable.id),
  schoolPeriodId: integer()
    .notNull()
    .references(() => anoLetivoTable.id),
  baseClassId: integer()
    .notNull()
    .references(() => baseCurricularTable.id),
  letter: varchar({ length: 1 }).notNull(),
  shift: shiftsEnum().notNull(),
  studentsLimit: integer().notNull().default(40),
});

export const cargosTable = pgTable("occupations", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar({ length: 100 }).notNull(),
  canTeach: boolean().default(false),
  createdAt: timestamp().defaultNow(),
});

export const colaboradoresTable = pgTable("employees", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  userId: integer()
    .notNull()
    .references(() => usuarioTable.id),
  createdAt: timestamp().notNull().defaultNow(),
});

export const statusContratoEnum = pgEnum("status_contract", ["active", "unactive"]);

export const contratosTable = pgTable(
  "contracts",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    employeeId: integer()
      .notNull()
      .references(() => colaboradoresTable.id),
    occupationId: integer()
      .notNull()
      .references(() => cargosTable.id),
    unitId: integer("institution_unit_id")
      .notNull()
      .references(() => unidadeTable.id),
    registrationNumber: varchar("registration_number", { length: 50 }),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    status: statusContratoEnum().default("unactive"),
    salary: decimal({ precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("contracts_employee_id_idx").on(table.employeeId),
    index("institution_unit_id_employee_id_idx").on(table.unitId, table.employeeId),
    index("occupation_id_idx").on(table.occupationId),
  ]
);

export const contratoProfessorDisciplinaTable = pgTable(
  "contract_professor_discipline",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    contractId: integer()
      .notNull()
      .references(() => contratosTable.id),
    disciplineId: integer()
      .notNull()
      .references(() => disciplinasTable.id),
    etapaId: integer()
      .notNull()
      .references(() => etapaTable.id),
  },
  (table) => [
    unique("contract_professor_discipline_unique_idx").on(table.contractId, table.disciplineId, table.etapaId),
  ]
);

export const estudantesTable = pgTable("students", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  userId: integer().references(() => usuarioTable.id),
  cpf: varchar({ length: 11 }).notNull(),
  name: varchar({ length: 100 }).notNull(),
  birthDate: date().notNull(),
});

export const documentsTable = pgTable("documents", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  url: varchar({ length: 255 }),
  content: varchar(),
  status: varchar(),
});

export const matriculasTable = pgTable("matriculations", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  unitId: integer()
    .notNull()
    .references(() => unidadeTable.id),
  studentId: integer()
    .notNull()
    .references(() => estudantesTable.id),
  schoolPeriodId: integer()
    .notNull()
    .references(() => anoLetivoTable.id),
  status: varchar().notNull(),
  createdDate: date().notNull(),
  proofOfResidenceId: integer().notNull().references(() => documentsTable.id),
  scholarHistoryId: integer().notNull().references(() => documentsTable.id),
});
