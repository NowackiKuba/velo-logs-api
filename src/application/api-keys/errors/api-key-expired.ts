import { BaseError } from 'base-error';

export class ApiKeyExpiredError extends BaseError {
  readonly code = 'API_KEY_EXPIRED';
}
