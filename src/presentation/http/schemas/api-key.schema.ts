import { Static, t } from 'elysia';

export const CreateApiKeyBodySchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 55 }),
  env: t.Union([t.Literal('PRODUCTION'), t.Literal('STAGING'), t.Literal('DEVELOPMENT')]),
  projectId: t.String({ format: 'uuid' }),
  expiresAt: t.Date(),
});

export type CreateApiKeyBodyInput = Static<typeof CreateApiKeyBodySchema>;

export const ListApiKeysQuerySchema = t.Object({
  projectId: t.Optional(t.String({ format: 'uuid' })),
});

export type ListApiKeysQueryInput = Static<typeof ListApiKeysQuerySchema>;
