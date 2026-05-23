import { pgTable, timestamp, uuid, varchar, jsonb, pgEnum, index } from 'drizzle-orm/pg-core';

// 1. Definiujemy sztywny zestaw poziomów logowania, żeby nie marnować miejsca w bazie
export const logLevelEnum = pgEnum('log_level', ['debug', 'info', 'warn', 'error', 'fatal']);

export const logsTable = pgTable(
  'logs',
  {
    id: uuid('id').primaryKey().defaultRandom(), // Pozwól bazie samej generować UUID przy bulk insertach

    // Z jakiego projektu pochodzi log (powiązanie logiczne z Velo)
    projectId: uuid('project_id').notNull(),

    // Nazwa mikroserwisu, np. 'billy-api', 'politi-worker'
    service: varchar('service', { length: 50 }).notNull(),

    // Środowisko: 'production', 'staging', 'development'
    environment: varchar('environment', { length: 20 }).notNull().default('production'),

    // Poziom logu (enum zamiast stringa drastycznie przyspiesza filtrowanie)
    level: logLevelEnum('level').notNull().default('info'),

    // Krótka treść logu, np. "Stripe charge successful" albo "Database connection timeout"
    message: varchar('message', { length: 255 }).notNull(),

    // Serce logowania strukturyzowanego - tutaj wpada cały kontekst (userId, error stack, metadata)
    meta: jsonb('meta').notNull().default({}),

    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => {
    return {
      // Indeksy są KLUCZOWE. Bez nich wyszukiwanie logów przy milionie rekordów zamrozi dashboard.
      projectEnvIdx: index('project_env_idx').on(table.projectId, table.environment),
      serviceIdx: index('service_idx').on(table.service),
      levelIdx: index('level_idx').on(table.level),
      createdAtIdx: index('created_at_idx').on(table.createdAt), // Do sortowania chronologicznego na froncie
    };
  },
);

export type DbLog = typeof logsTable.$inferSelect;
export type DbNewLog = typeof logsTable.$inferInsert;
