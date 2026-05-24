export type LogLevelType = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export const VALID_LOG_LEVELS: LogLevelType[] = ['debug', 'info', 'warn', 'error', 'fatal'];

export class LogLevel {
  private constructor(private readonly _value: LogLevelType) {}

  static create(v: string) {
    if (!v || v.trim().length < 0) {
      throw new Error('log level cannot be empty');
    }

    const normalized = v.toLowerCase() as LogLevelType;
    const validLevel = VALID_LOG_LEVELS.find((level) => level === normalized);

    if (!validLevel) {
      throw new Error(`invalid log level: ${v}`);
    }

    return new LogLevel(validLevel);
  }

  get value(): LogLevelType {
    return this._value;
  }

  static debug() {
    return new LogLevel('debug');
  }

  static info() {
    return new LogLevel('info');
  }

  static warn() {
    return new LogLevel('warn');
  }

  static error() {
    return new LogLevel('error');
  }

  static fatal() {
    return new LogLevel('fatal');
  }
}
