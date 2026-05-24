import type { ApiKeyEnvType } from '@/domain/api-keys/value-objects/api-key-env.vo';

export type CurrentApiKey = {
  id: string;
  name: string;
  env: ApiKeyEnvType;
  projectId: string;
  secretPrefix: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type ApiKeyAuthContext = {
  currentApiKey: CurrentApiKey | null;
};
