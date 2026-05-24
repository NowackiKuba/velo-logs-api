import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { projectsTable } from '../projects';

export const apiKeysTable = pgTable('api_keys', {
  id: uuid('id').primaryKey().notNull().default(crypto.randomUUID()),
  name: varchar('name', { length: 55 }).notNull(),
  env: varchar('env', { enum: ['PRODUCTION', 'STAGING', 'DEVELOPMENT'] }).notNull(),
  secret: varchar('secret', { length: 255 }).notNull(),
  secretPrefix: varchar('secret_prefix', { length: 40 }).notNull(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projectsTable.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deletedAt'),
});

export type DbApiKey = typeof apiKeysTable.$inferSelect;
export type DbNewApiKey = typeof apiKeysTable.$inferInsert;
