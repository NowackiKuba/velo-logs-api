import { relations } from 'drizzle-orm';
import { projectsTable } from './projects/projects';
import { usersTable } from './users/users';
import { projectMembersTable } from './projects';

export const usersRelations = relations(usersTable, ({ many, one }) => ({
  projectMemberships: many(projectMembersTable, { relationName: 'projectMembership' }),
  invitedProjectMemberships: many(projectMembersTable, { relationName: 'projectInvitation' }),
  activeProject: one(projectsTable, {
    fields: [usersTable.activeProjectId],
    references: [projectsTable.id],
    relationName: 'activeProject',
  }),
}));

export const projectsRelations = relations(projectsTable, ({ many }) => ({
  activeUsers: many(usersTable, { relationName: 'activeProject' }),
}));

export const projectMembersRelations = relations(projectMembersTable, ({ one }) => ({
  project: one(projectsTable, {
    fields: [projectMembersTable.projectId],
    references: [projectsTable.id],
  }),
  user: one(usersTable, {
    fields: [projectMembersTable.userId],
    references: [usersTable.id],
    relationName: 'projectMembership',
  }),
}));
