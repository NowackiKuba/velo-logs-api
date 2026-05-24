export const API_KEY_NAME_MAX_LENGTH = 55;

export class ApiKeyName {
  private constructor(private readonly _value: string) {}

  static create(v: string) {
    if (!v || v.trim().length < 0) {
      throw new Error('api key name cannot be empty');
    }

    if (v.length > API_KEY_NAME_MAX_LENGTH) {
      throw new Error(`api key name cannot be longer than ${API_KEY_NAME_MAX_LENGTH} chars`);
    }

    return new ApiKeyName(v);
  }

  get value(): string {
    return this._value;
  }
}
