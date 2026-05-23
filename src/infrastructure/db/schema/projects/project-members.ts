import { jsonb, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { usersTable } from '../users/users';
import { projectsTable } from './projects';

export const projectMembersTable = pgTable('projects', {
  id: uuid('id').primaryKey().notNull().default(crypto.randomUUID()),
  userId: uuid('user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
  projectId: uuid('project_id')
    .references(() => projectsTable.id, { onDelete: 'cascade' })
    .notNull(),
  permissions: jsonb('permissions').notNull(),
  status: varchar('status', { enum: ['PENDING', 'ACTIVE', 'TERMINATED'] }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export type DbProjectMember = typeof projectMembersTable.$inferSelect;
export type DbNewProjectMember = typeof projectMembersTable.$inferInsert;
