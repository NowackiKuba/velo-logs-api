import { CreateApiKeyUseCase } from '@/application/api-keys/use-cases/create-api-key.use-case';
import { ListProjectApiKeysUseCase } from '@/application/api-keys/use-cases/list-project-api-keys.use-case';
import { ActiveProjectNotSetError } from '@/application/user/errors/active-project-not-set.error';
import { ApiKey } from '@/domain/api-keys/entities/api-key';
import { getCurrentUser } from '@/presentation/http/types/get-current-user';
import type { AnyElysia } from 'elysia';
import Elysia from 'elysia';
import { CreateApiKeyBodySchema, ListApiKeysQuerySchema } from '../schemas/api-key.schema';

const toPublicApiKey = (apiKey: ApiKey) => ({
  id: apiKey.id.value,
  name: apiKey.name.value,
  env: apiKey.env.value,
  projectId: apiKey.projectId.value,
  secretPrefix: apiKey.secretPrefix.value,
  expiresAt: apiKey.expiresAt,
  createdAt: apiKey.createdAt,
  updatedAt: apiKey.updatedAt,
});

export const createApiKeysController = (
  createApiKeyUseCase: CreateApiKeyUseCase,
  listProjectApiKeysUseCase: ListProjectApiKeysUseCase,
  authMiddleware: AnyElysia,
) =>
  new Elysia({ prefix: '/api-keys' })
    .use(authMiddleware)
    .post(
      '/',
      async ({ body, set }) => {
        const result = await createApiKeyUseCase.execute({
          name: body.name,
          env: body.env,
          projectId: body.projectId,
          expiresAt: body.expiresAt,
        });

        set.status = 201;
        return result;
      },
      {
        body: CreateApiKeyBodySchema,
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

        const apiKeys = await listProjectApiKeysUseCase.execute({
          userId: user.id,
          projectId,
        });

        return {
          data: apiKeys.map(toPublicApiKey),
        };
      },
      {
        query: ListApiKeysQuerySchema,
      },
    );
