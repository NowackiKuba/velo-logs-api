import type { ApiKey } from '@/domain/api-keys/entities/api-key';
import type { CurrentApiKey } from './current-api-key';

export const toCurrentApiKey = (apiKey: ApiKey): CurrentApiKey => ({
  id: apiKey.id.value,
  name: apiKey.name.value,
  env: apiKey.env.value,
  projectId: apiKey.projectId.value,
  secretPrefix: apiKey.secretPrefix.value,
  expiresAt: apiKey.expiresAt,
  createdAt: apiKey.createdAt,
  updatedAt: apiKey.updatedAt,
});
