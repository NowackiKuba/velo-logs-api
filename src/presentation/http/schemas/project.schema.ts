import { Static, t } from 'elysia';

const HEX_COLOR_PATTERN = '^#[0-9a-fA-F]{6}$';
const SLUG_PATTERN = '^[a-z0-9]+(?:-[a-z0-9]+)*$';

export const CreateProjectBodySchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 55 }),
  slug: t.Optional(t.String({ minLength: 1, maxLength: 55, pattern: SLUG_PATTERN })),
  color: t.Optional(t.String({ pattern: HEX_COLOR_PATTERN })),
  description: t.Optional(t.String({ maxLength: 255 })),
});

export type CreateProjectBodyInput = Static<typeof CreateProjectBodySchema>;

export const UpdateProjectBodySchema = t.Object(
  {
    name: t.Optional(t.String({ minLength: 1, maxLength: 55 })),
    slug: t.Optional(t.String({ minLength: 1, maxLength: 55, pattern: SLUG_PATTERN })),
    color: t.Optional(t.String({ pattern: HEX_COLOR_PATTERN })),
    description: t.Optional(t.Union([t.String({ maxLength: 255 }), t.Null()])),
  },
  { minProperties: 1 },
);

export type UpdateProjectBodyInput = Static<typeof UpdateProjectBodySchema>;

export const ProjectParamsSchema = t.Object({
  id: t.String({ format: 'uuid' }),
});

export type ProjectParamsInput = Static<typeof ProjectParamsSchema>;

export const ListProjectsQuerySchema = t.Object({
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
  offset: t.Optional(t.Numeric({ minimum: 0 })),
  orderBy: t.Optional(t.Union([t.Literal('asc'), t.Literal('desc')])),
  orderByField: t.Optional(t.Union([t.Literal('createdAt'), t.Literal('updatedAt'), t.Literal('name'), t.Literal('slug')])),
  search: t.Optional(t.String()),
});

export type ListProjectsQueryInput = Static<typeof ListProjectsQuerySchema>;

export const ProjectResponseSchema = t.Object({
  id: t.String({ format: 'uuid' }),
  name: t.String(),
  slug: t.String({ pattern: SLUG_PATTERN }),
  color: t.String({ pattern: HEX_COLOR_PATTERN }),
  description: t.Optional(t.String()),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type ProjectResponse = Static<typeof ProjectResponseSchema>;
