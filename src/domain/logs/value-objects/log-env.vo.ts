export type LogEnvType = 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';

export const VALID_TYPES: LogEnvType[] = ['DEVELOPMENT', 'STAGING', 'PRODUCTION'];

export class LogEnvironment {
  private constructor(private readonly _value: LogEnvType) {}

  static create(v: string) {
    if (!v || v.trim().length < 0) {
      throw new Error('log environment cannot be empty');
    }

    const normalized = v.toUpperCase() as LogEnvType;
    const validType = VALID_TYPES.find((t) => t === normalized);

    if (!validType) {
      throw new Error(`invalid log environment: ${v}`);
    }

    return new LogEnvironment(validType);
  }

  get value(): LogEnvType {
    return this._value;
  }

  static dev() {
    return new LogEnvironment('DEVELOPMENT');
  }
  static staging() {
    return new LogEnvironment('STAGING');
  }
  static prod() {
    return new LogEnvironment('PRODUCTION');
  }
}
