import { BaseError } from 'base-error';

export class ApiKeyNotFoundError extends BaseError {
  readonly code = 'API_KEY_NOT_FOUND';
}
