import type { AnyElysia } from 'elysia';
import Elysia from 'elysia';
import { getCurrentUser } from '@/presentation/http/types/get-current-user';

export const createUsersController = (authMiddleware: AnyElysia) =>
  new Elysia({ prefix: '/users' })
    .use(authMiddleware)
    .get('/me', ({ currentUser, userId }) => getCurrentUser(currentUser, userId));
