import { relations } from "drizzle-orm";
import { boolean, date, index, integer, pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

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

export const disciplinaTable = pgTable("disciplines", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar({ length: 50 }).notNull(),
  annual_workload: integer().notNull(),
  baseId: integer()
    .notNull()
    .references(() => baseCurricularTable.id),
});

export const disciplinaRelations = relations(disciplinaTable, ({ one }) => ({
  base: one(baseCurricularTable, {
    fields: [disciplinaTable.baseId],
    references: [baseCurricularTable.id],
  }),
}));

export const usuarioTable = pgTable("users", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar({ length: 100 }).notNull(),
  email: varchar({ length: 100 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  phone: varchar({ length: 20 }),
  escolaId: integer("school_id").references(() => escolaTable.id),
  createdAt: timestamp().notNull().defaultNow(),
  isAdmin: boolean().notNull().default(false),
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

export const statusContratoEnum = pgEnum("status_contract", ["active", "unactive"]);

export const contratosTable = pgTable(
  "contracts",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: integer()
      .notNull()
      .references(() => usuarioTable.id),
    occupationId: integer()
      .notNull()
      .references(() => cargosTable.id),
    unitId: integer("institution_unit_id")
      .notNull()
      .references(() => unidadeTable.id),
    registrationNumber: varchar({ length: 50 }),
    startDate: date().notNull(),
    endDate: date(),
    status: statusContratoEnum().default("unactive"),
    createdAt: timestamp().defaultNow(),
  },
  (table) => [
    index("institution_unit_id_user_id_idx").on(table.unitId, table.userId),
    index("user_id_idx").on(table.userId),
    index("occupation_id_idx").on(table.occupationId),
  ]
);
