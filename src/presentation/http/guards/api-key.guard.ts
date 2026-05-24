import { Elysia } from 'elysia';
import type { CurrentApiKey } from '@/presentation/http/types/current-api-key';

/**
 * API key guard — routes marked `requiresApiKey: true` require a valid API key.
 *
 * Must be registered after `createApiKeyMiddleware` so `currentApiKey` is available.
 * Pair with `isPublic: true` on the same route to skip session auth.
 *
 * @example
 * .post('/ingest', handler, { isPublic: true, requiresApiKey: true })
 */
export const createApiKeyGuard = () =>
  new Elysia({ name: 'api-key-guard' })
    .macro({
      requiresApiKey(enabled: boolean) {
        if (!enabled) return;

        return {
          resolve: () => ({ requiresApiKey: true as const }),
        };
      },
    })
    .resolve({ as: 'global' }, (context) => {
      const requiresApiKey = (context as { requiresApiKey?: boolean }).requiresApiKey;
      const existingApiKey = (context as { currentApiKey?: CurrentApiKey | null }).currentApiKey;

      if (!requiresApiKey) {
        return { currentApiKey: existingApiKey ?? null };
      }

      return {
        currentApiKey: existingApiKey?.id ? existingApiKey : null,
      };
    })
    .onBeforeHandle((context) => {
      if (!(context as { requiresApiKey?: boolean }).requiresApiKey) return;

      const currentApiKey = (context as { currentApiKey?: CurrentApiKey | null }).currentApiKey;

      if (!currentApiKey?.id) {
        context.set.status = 401;
        return { message: 'Unauthorized' };
      }
    });

/** @deprecated Use `createApiKeyGuard()` */
export const apiKeyGuard = createApiKeyGuard();
