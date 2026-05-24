import { generateCode } from '@/utils/generate-code';
import { ApiKeySecretPrefix } from './api-key-secret-prefix.vo';

export const API_KEY_SECRET_MAX_LENGTH = 40;
export const API_KEY_SECRET_STORED_MAX_LENGTH = 255;
export const API_KEY_SECRET_PREFIX_LENGTH = 8;

export class ApiKeySecret {
  private constructor(private readonly _value: string) {}

  static create(v: string) {
    if (!v || v.trim().length < 0) {
      throw new Error('api key secret cannot be empty');
    }

    if (v.length > API_KEY_SECRET_MAX_LENGTH) {
      throw new Error(`api key secret cannot be longer than ${API_KEY_SECRET_MAX_LENGTH} chars`);
    }

    return new ApiKeySecret(v);
  }

  static reconstitute(v: string) {
    if (!v || v.trim().length < 0) {
      throw new Error('api key secret cannot be empty');
    }

    if (v.length > API_KEY_SECRET_STORED_MAX_LENGTH) {
      throw new Error(`api key secret cannot be longer than ${API_KEY_SECRET_STORED_MAX_LENGTH} chars`);
    }

    return new ApiKeySecret(v);
  }

  static generate(): { secret: ApiKeySecret; prefix: ApiKeySecretPrefix } {
    const raw = `velo_${generateCode(16)}`;
    const secret = ApiKeySecret.create(raw);
    const prefix = ApiKeySecretPrefix.create(raw.slice(0, API_KEY_SECRET_PREFIX_LENGTH));

    return { secret, prefix };
  }

  get value(): string {
    return this._value;
  }
}
