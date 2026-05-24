import { BaseError } from 'base-error';

export class ProjectSlugAlreadyExistsError extends BaseError {
  readonly code = 'PROJECT_SLUG_ALREADY_EXISTS';
}
