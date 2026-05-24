export type ApiKeyEnvType = 'PRODUCTION' | 'STAGING' | 'DEVELOPMENT';

export const VALID_TYPES: ApiKeyEnvType[] = ['PRODUCTION', 'STAGING', 'DEVELOPMENT'];

export class ApiKeyEnv {
  private constructor(private readonly _value: ApiKeyEnvType) {}

  static create(v: string) {
    if (!v || v.trim().length < 0) {
      throw new Error('api key env cannot be empty');
    }

    const validType = VALID_TYPES.find((t) => t === v);

    if (!validType) {
      throw new Error(`invalid api key env: ${v}`);
    }

    return new ApiKeyEnv(validType);
  }

  get value(): ApiKeyEnvType {
    return this._value;
  }

  static production() {
    return new ApiKeyEnv('PRODUCTION');
  }
  static staging() {
    return new ApiKeyEnv('STAGING');
  }
  static development() {
    return new ApiKeyEnv('DEVELOPMENT');
  }
}
