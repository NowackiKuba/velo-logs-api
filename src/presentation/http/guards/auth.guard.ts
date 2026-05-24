import { Elysia } from 'elysia';
import type { CurrentUser } from '@/presentation/http/types/current-user';
import { normalizeToCurrentUser } from '@/presentation/http/types/normalize-to-current-user';

/**
 * Global auth guard — all routes require authentication unless marked `isPublic: true`.
 *
 * Must be registered after `createAuthMiddleware` so `currentUser` is available.
 *
 * @example
 * .get('/health', () => ({ ok: true }), { isPublic: true })
 */
export const createAuthGuard = () =>
  new Elysia({ name: 'auth-guard' })
    .macro({
      isPublic(enabled: boolean) {
        if (!enabled) return;

        return {
          resolve: () => ({ skipAuth: true as const }),
        };
      },
    })
    .resolve({ as: 'global' }, (context) => {
      const skipAuth = (context as { skipAuth?: boolean }).skipAuth;

      if (skipAuth) {
        return {
          currentUser: null as CurrentUser | null,
          userId: null as string | null,
        };
      }

      const normalized = normalizeToCurrentUser(context.currentUser);

      if (!normalized) {
        return {
          currentUser: null as CurrentUser | null,
          userId: null as string | null,
        };
      }

      return {
        currentUser: normalized,
        userId: normalized.id,
      };
    })
    .onBeforeHandle((context) => {
      if ((context as { skipAuth?: boolean }).skipAuth) return;

      if (!context.currentUser?.id) {
        context.set.status = 401;
        return { message: 'Unauthorized' };
      }
    });

/** @deprecated Use `createAuthGuard()` */
export const authGuard = createAuthGuard();
