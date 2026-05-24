import { ApiKeyNotFoundError } from '@/application/api-keys/errors/api-key-not-found';
import type { CurrentApiKey } from './current-api-key';

export const getCurrentApiKey = (currentApiKey: CurrentApiKey | null | undefined): CurrentApiKey => {
  if (!currentApiKey?.id) {
    throw new ApiKeyNotFoundError('Invalid or missing API key');
  }

  return currentApiKey;
};
