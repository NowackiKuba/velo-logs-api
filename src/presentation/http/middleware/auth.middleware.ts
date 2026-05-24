import { cookie } from '@elysiajs/cookie';
import type { AnyElysia } from 'elysia';
import { Elysia } from 'elysia';
import type { TokenServicePort } from '@/application/auth/ports/token-service.port';
import type { FindUserByIdUseCase } from '@/application/user/use-cases/find-user-by-id.use-case';
import type { AuthContext } from '@/presentation/http/types/current-user';
import { toCurrentUser } from '@/presentation/http/types/to-current-user';
import { createAuthGuard } from '@/presentation/http/guards/auth.guard';
import { SESSION_COOKIE_NAME } from '@/presentation/http/constants/session';

const readTokenFromAuthorizationHeader = (authorizationHeader: string | null): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  const trimmed = authorizationHeader.trim();
  const bearerPrefix = 'Bearer ';
  const token = trimmed.startsWith(bearerPrefix) ? trimmed.slice(bearerPrefix.length).trim() : trimmed;

  return token || null;
};

/**
 * Resolves `currentUser` from the session cookie on every request.
 */
export const createAuthMiddleware = (findUserById: FindUserByIdUseCase, tokenService: TokenServicePort) =>
  new Elysia({ name: 'auth-context' })
    .use(cookie())
    .derive({ as: 'global' }, async ({ cookie, request }): Promise<AuthContext> => {
      const sessionTokenRaw = cookie[SESSION_COOKIE_NAME]?.value;
      const sessionToken = typeof sessionTokenRaw === 'string' ? sessionTokenRaw : null;
      const headerToken = readTokenFromAuthorizationHeader(request.headers.get('authorization'));
      const token = headerToken ?? sessionToken;

      if (token?.startsWith('velo_')) {
        return { userId: null, currentUser: null };
      }

      if (!token) {
        return { userId: null, currentUser: null };
      }

      try {
        const payload = await tokenService.verify(token);
        if (!payload?.userId) {
          return { userId: null, currentUser: null };
        }

        const user = await findUserById.execute(payload.userId);

        if (!user) {
          return { userId: null, currentUser: null };
        }

        const currentUser = toCurrentUser(user);

        return {
          userId: currentUser.id,
          currentUser,
        };
      } catch {
        return { userId: null, currentUser: null };
      }
    });

export const createAuthStack = (findUserById: FindUserByIdUseCase, tokenService: TokenServicePort) => {
  const authMiddleware = createAuthMiddleware(findUserById, tokenService);
  const authGuard = createAuthGuard();

  const authStack = new Elysia({ name: 'auth-stack' }).use(authMiddleware).use(authGuard);

  return {
    authMiddleware: authMiddleware as unknown as AnyElysia,
    authGuard: authGuard as unknown as AnyElysia,
    authStack: authStack as unknown as AnyElysia,
  };
};

/**
 * @deprecated Prefer global `createAuthGuard()` with `isPublic: true` on public routes.
 */
export const requireAuth = new Elysia({ name: 'require-auth' }).onBeforeHandle(({ currentUser, set }) => {
  if (!currentUser?.id) {
    set.status = 401;
    return { message: 'Unauthorized' };
  }
});
