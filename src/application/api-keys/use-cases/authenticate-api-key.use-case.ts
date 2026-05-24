import { timingSafeEqual } from 'crypto';
import { ApiKeyExpiredError } from '@/application/api-keys/errors/api-key-expired';
import { ApiKeyNotFoundError } from '@/application/api-keys/errors/api-key-not-found';
import { SecretCipherPort } from '@/application/api-keys/ports/secret-cipher.port';
import { ApiKey } from '@/domain/api-keys/entities/api-key';
import { ApiKeyRepositoryPort } from '@/domain/api-keys/repositories/api-key.repository.port';
import { API_KEY_SECRET_PREFIX_LENGTH } from '@/domain/api-keys/value-objects/api-key-secret.vo';

const API_KEY_PREFIX = 'velo_';

export class AuthenticateApiKeyUseCase {
  constructor(
    private readonly apiKeyRepo: ApiKeyRepositoryPort,
    private readonly cipher: SecretCipherPort,
  ) {}

  async execute(rawSecret: string): Promise<ApiKey> {
    if (!rawSecret || !rawSecret.startsWith(API_KEY_PREFIX)) {
      throw new ApiKeyNotFoundError('Invalid or missing API key');
    }

    const secretPrefix = rawSecret.slice(0, API_KEY_SECRET_PREFIX_LENGTH);
    const candidates = await this.apiKeyRepo.findBySecretPrefix(secretPrefix);

    for (const candidate of candidates) {
      if (candidate.isDeleted) {
        continue;
      }

      const storedSecret = this.cipher.decrypt(candidate.secret.value);
      const provided = Buffer.from(rawSecret, 'utf8');
      const stored = Buffer.from(storedSecret, 'utf8');

      if (provided.length !== stored.length || !timingSafeEqual(provided, stored)) {
        continue;
      }

      if (candidate.expiresAt.getTime() <= Date.now()) {
        throw new ApiKeyExpiredError(`API key expired at ${candidate.expiresAt.toISOString()}`);
      }

      return candidate;
    }

    throw new ApiKeyNotFoundError('Invalid or missing API key');
  }
}
