import { CreateLogUseCase } from '@/application/logs/use-cases/create-log.use-case';
import { ListLogsUseCase } from '@/application/logs/use-cases/list-logs.use-case';
import { Log } from '@/domain/logs/entities/log.entity';
import { getCurrentApiKey } from '@/presentation/http/types/get-current-api-key';
import { getCurrentUser } from '@/presentation/http/types/get-current-user';
import { ActiveProjectNotSetError } from '@/application/user/errors/active-project-not-set.error';
import type { AnyElysia } from 'elysia';
import Elysia from 'elysia';
import { CreateLogBodySchema, ListLogsQuerySchema } from '../schemas/log.schema';

const toPublicLog = (log: Log) => ({
  id: log.id.value,
  projectId: log.projectId.value,
  service: log.service,
  environment: log.environment.value,
  level: log.level.value,
  message: log.message,
  meta: log.meta,
  createdAt: log.createdAt,
});

export const createLogsController = (
  createLogUseCase: CreateLogUseCase,
  listLogsUseCase: ListLogsUseCase,
  authMiddleware: AnyElysia,
) =>
  new Elysia({ prefix: '/logs' })
    .use(authMiddleware)
    .post(
      '/',
      async ({ body, currentApiKey, set }) => {
        const apiKey = getCurrentApiKey(currentApiKey);

        const result = await createLogUseCase.execute({
          projectId: apiKey.projectId,
          apiKeyEnv: apiKey.env,
          service: body.service,
          environment: body.environment,
          level: body.level,
          message: body.message,
          meta: body.meta,
        });

        set.status = 201;
        return result;
      },
      {
        body: CreateLogBodySchema,
        isPublic: true,
        requiresApiKey: true,
      },
    )
    .get(
      '/',
      async ({ query, currentUser, userId }) => {
        const user = getCurrentUser(currentUser, userId);
        const projectId = query.projectId ?? user.activeProjectId;

        if (!projectId) {
          throw new ActiveProjectNotSetError('No active project set. Provide projectId or set an active project.');
        }

        const page = await listLogsUseCase.execute({
          userId: user.id,
          projectId,
          filters: {
            limit: query.limit,
            offset: query.offset,
            orderBy: query.orderBy,
            orderByField: query.orderByField,
            environment: query.environment,
            level: query.level,
            service: query.service,
            search: query.search,
          },
        });

        return {
          data: page.data.map(toPublicLog),
          page: page.page,
        };
      },
      {
        query: ListLogsQuerySchema,
      },
    );
