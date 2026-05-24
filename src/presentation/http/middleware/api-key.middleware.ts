import type { AnyElysia } from 'elysia';
import { Elysia } from 'elysia';
import type { AuthenticateApiKeyUseCase } from '@/application/api-keys/use-cases/authenticate-api-key.use-case';
import { createApiKeyGuard } from '@/presentation/http/guards/api-key.guard';
import type { ApiKeyAuthContext } from '@/presentation/http/types/current-api-key';
import { toCurrentApiKey } from '@/presentation/http/types/to-current-api-key';

const API_KEY_PREFIX = 'velo_';
const API_KEY_HEADER = 'x-api-key';

const readApiKeyFromRequest = (request: Request): string | null => {
  const headerKey = request.headers.get(API_KEY_HEADER)?.trim();
  if (headerKey?.startsWith(API_KEY_PREFIX)) {
    return headerKey;
  }

  const authorization = request.headers.get('authorization')?.trim();
  if (!authorization) {
    return null;
  }

  const bearerPrefix = 'Bearer ';
  const token = authorization.startsWith(bearerPrefix) ? authorization.slice(bearerPrefix.length).trim() : authorization;

  return token.startsWith(API_KEY_PREFIX) ? token : null;
};

export const createApiKeyMiddleware = (authenticateApiKey: AuthenticateApiKeyUseCase) =>
  new Elysia({ name: 'api-key-context' }).derive({ as: 'global' }, async ({ request }): Promise<ApiKeyAuthContext> => {
    const rawSecret = readApiKeyFromRequest(request);

    if (!rawSecret) {
      return { currentApiKey: null };
    }

    try {
      const apiKey = await authenticateApiKey.execute(rawSecret);

      return {
        currentApiKey: toCurrentApiKey(apiKey),
      };
    } catch {
      return { currentApiKey: null };
    }
  });

export const createApiKeyStack = (authenticateApiKey: AuthenticateApiKeyUseCase) => {
  const apiKeyMiddleware = createApiKeyMiddleware(authenticateApiKey);
  const apiKeyGuard = createApiKeyGuard();

  const apiKeyStack = new Elysia({ name: 'api-key-stack' }).use(apiKeyMiddleware).use(apiKeyGuard);

  return {
    apiKeyMiddleware: apiKeyMiddleware as unknown as AnyElysia,
    apiKeyGuard: apiKeyGuard as unknown as AnyElysia,
    apiKeyStack: apiKeyStack as unknown as AnyElysia,
  };
};
