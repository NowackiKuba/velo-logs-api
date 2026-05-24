import { Static, t } from 'elysia';

export const SetActiveProjectBodySchema = t.Object({
  projectId: t.String({ format: 'uuid' }),
});

export type SetActiveProjectBodyInput = Static<typeof SetActiveProjectBodySchema>;
