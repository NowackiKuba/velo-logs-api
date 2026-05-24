import { slugify } from '@/utils/slugify';

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const PROJECT_SLUG_MAX_LENGTH = 55;

export class ProjectSlug {
  private constructor(private readonly _value: string) {}

  static create(v: string) {
    if (!v || v.trim().length < 0) {
      throw new Error('project slug cannot be empty');
    }

    if (v.length > PROJECT_SLUG_MAX_LENGTH) {
      throw new Error(`project slug cannot be longer than ${PROJECT_SLUG_MAX_LENGTH} chars`);
    }

    if (!SLUG_REGEX.test(v)) {
      throw new Error('project slug must contain only lowercase letters, numbers, and hyphens');
    }

    return new ProjectSlug(v);
  }

  static fromName(name: string) {
    const slug = slugify(name);

    if (!slug) {
      throw new Error('project slug cannot be generated from name');
    }

    return ProjectSlug.create(slug.slice(0, PROJECT_SLUG_MAX_LENGTH).replace(/-+$/g, ''));
  }

  withSuffix(suffix: number) {
    const suffixText = `-${suffix}`;
    const base = this._value.slice(0, PROJECT_SLUG_MAX_LENGTH - suffixText.length).replace(/-+$/g, '');

    return ProjectSlug.create(`${base}${suffixText}`);
  }

  get value(): string {
    return this._value;
  }
}
