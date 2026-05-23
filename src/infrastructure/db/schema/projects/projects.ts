import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const projectsTable = pgTable('projects', {
  id: uuid('id').primaryKey().notNull().default(crypto.randomUUID()),
  name: varchar('name', { length: 55 }).notNull(),
  slug: varchar('slug', { length: 55 }).notNull().unique(),
  description: varchar('description', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export type DbProject = typeof projectsTable.$inferSelect;
export type DbNewProject = typeof projectsTable.$inferInsert;
