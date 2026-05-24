import { BaseError } from 'base-error';

export class ActiveProjectNotSetError extends BaseError {
  readonly code = 'ACTIVE_PROJECT_NOT_SET';
}
