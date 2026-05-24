export const API_KEY_SECRET_PREFIX_MAX_LENGTH = 40;

export class ApiKeySecretPrefix {
  private constructor(private readonly _value: string) {}

  static create(v: string) {
    if (!v || v.trim().length < 0) {
      throw new Error('api key secret prefix cannot be empty');
    }

    if (v.length > API_KEY_SECRET_PREFIX_MAX_LENGTH) {
      throw new Error(`api key secret prefix cannot be longer than ${API_KEY_SECRET_PREFIX_MAX_LENGTH} chars`);
    }

    return new ApiKeySecretPrefix(v);
  }

  get value(): string {
    return this._value;
  }
}
