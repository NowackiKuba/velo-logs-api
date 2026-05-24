export const PROJECT_DESCRIPTION_MAX_LENGTH = 255;

export class ProjectDescription {
  private constructor(private readonly _value: string) {}

  static create(v: string) {
    if (v.length > PROJECT_DESCRIPTION_MAX_LENGTH) {
      throw new Error(`project description cannot be longer than ${PROJECT_DESCRIPTION_MAX_LENGTH} chars`);
    }

    return new ProjectDescription(v);
  }

  get value(): string {
    return this._value;
  }
}
