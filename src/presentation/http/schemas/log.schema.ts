import { Static, t } from 'elysia';

const LOG_LEVELS = t.Union([t.Literal('debug'), t.Literal('info'), t.Literal('warn'), t.Literal('error'), t.Literal('fatal')]);
const LOG_ENVIRONMENTS = t.Union([t.Literal('DEVELOPMENT'), t.Literal('STAGING'), t.Literal('PRODUCTION')]);

export const CreateLogBodySchema = t.Object({
  service: t.String({ minLength: 1, maxLength: 50 }),
  environment: t.Optional(LOG_ENVIRONMENTS),
  level: LOG_LEVELS,
  message: t.String({ minLength: 1, maxLength: 255 }),
  meta: t.Optional(t.Record(t.String(), t.Any())),
});

export type CreateLogBodyInput = Static<typeof CreateLogBodySchema>;

export const ListLogsQuerySchema = t.Object({
  projectId: t.Optional(t.String({ format: 'uuid' })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
  offset: t.Optional(t.Numeric({ minimum: 0 })),
  orderBy: t.Optional(t.Union([t.Literal('asc'), t.Literal('desc')])),
  orderByField: t.Optional(t.Union([t.Literal('createdAt'), t.Literal('level'), t.Literal('service')])),
  environment: t.Optional(LOG_ENVIRONMENTS),
  level: t.Optional(LOG_LEVELS),
  service: t.Optional(t.String({ minLength: 1, maxLength: 50 })),
  search: t.Optional(t.String()),
});

export type ListLogsQueryInput = Static<typeof ListLogsQuerySchema>;
