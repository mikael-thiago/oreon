import { relations } from "drizzle-orm";
import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const modalidadeTable = pgTable("modalities", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar({ length: 20 }).notNull(),
});

export const etapaTable = pgTable("step", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  sortOrder: integer().notNull(),
  name: varchar({ length: 50 }).notNull(),
  modalityId: integer().notNull(),
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

export const escolaTable = pgTable("sectors", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar({ length: 100 }).notNull(),
  email: varchar({ length: 100 }).notNull(),
  cnpj: varchar({ length: 14 }),
  phone1: varchar({ length: 20 }).notNull(),
  phone2: varchar({ length: 20 }),
  street: varchar({ length: 150 }),
  number: varchar({ length: 10 }),
  city: varchar({ length: 100 }),
  state: varchar({ length: 2 }),
  zipCode: varchar({ length: 15 }),
  country: varchar({ length: 50 }).default("Brasil"),
  createdAt: timestamp().notNull().defaultNow(),
});

export const baseCurricularTable = pgTable("base_class", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  code: varchar({ length: 12 }).notNull(),
  stepId: integer().notNull(),
  schoolId: integer("sector_id").notNull(),
  creationDate: timestamp().notNull().defaultNow(),
});

export const baseRelations = relations(baseCurricularTable, ({ one }) => ({
  etapa: one(etapaTable, {
    fields: [baseCurricularTable.stepId],
    references: [etapaTable.id],
  }),
  escola: one(escolaTable, {
    fields: [baseCurricularTable.schoolId],
    references: [escolaTable.id],
  }),
}));

export const disciplinaTable = pgTable("discipline", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar({ length: 50 }).notNull(),
  annual_workload: integer().notNull(),
  baseId: integer().notNull(),
});

export const disciplinaRelations = relations(disciplinaTable, ({ one }) => ({
  base: one(baseCurricularTable, {
    fields: [disciplinaTable.baseId],
    references: [baseCurricularTable.id],
  }),
}));

export const usuarioTable = pgTable("users", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  nome: varchar({ length: 100 }).notNull(),
  email: varchar({ length: 100 }).notNull().unique(),
  senha: varchar({ length: 255 }).notNull(),
  telefone: varchar({ length: 20 }),
  escolaId: integer("school_id").notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const usuarioRelations = relations(usuarioTable, ({ one }) => ({
  escola: one(escolaTable, {
    fields: [usuarioTable.escolaId],
    references: [escolaTable.id],
  }),
}));
