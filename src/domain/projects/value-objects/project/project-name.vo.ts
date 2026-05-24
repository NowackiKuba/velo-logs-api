export const PROJECT_NAME_MAX_LENGTH = 55;

export class ProjectName {
  private constructor(private readonly _value: string) {}

  static create(v: string) {
    if (!v || v.trim().length < 0) {
      throw new Error('project name cannot be empty');
    }

    if (v.length > PROJECT_NAME_MAX_LENGTH) {
      throw new Error(`project name cannot be longer than ${PROJECT_NAME_MAX_LENGTH} chars`);
    }

    return new ProjectName(v);
  }

  get value(): string {
    return this._value;
  }
}
