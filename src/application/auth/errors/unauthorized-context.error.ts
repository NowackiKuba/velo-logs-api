import { BaseError } from 'base-error';

export class UnauthorizedContextError extends BaseError {
  readonly code = 'UNAUTHORIZED';
}
