import { SetActiveProjectUseCase } from '@/application/user/use-cases/set-active-project.use-case';
import { getCurrentUser } from '@/presentation/http/types/get-current-user';
import type { AnyElysia } from 'elysia';
import Elysia from 'elysia';
import { SetActiveProjectBodySchema } from '../schemas/user.schema';

export const createUsersController = (
  authMiddleware: AnyElysia,
  setActiveProject: SetActiveProjectUseCase,
) =>
  new Elysia({ prefix: '/users' })
    .use(authMiddleware)
    .get('/me', ({ currentUser, userId }) => getCurrentUser(currentUser, userId))
    .patch(
      '/me/active-project',
      async ({ body, currentUser, userId }) => {
        const user = getCurrentUser(currentUser, userId);
        return setActiveProject.execute(user.id, body.projectId);
      },
      {
        body: SetActiveProjectBodySchema,
      },
    );
