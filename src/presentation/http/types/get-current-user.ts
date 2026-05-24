import { UnauthorizedContextError } from '@/application/auth/errors/unauthorized-context.error';
import type { CurrentUser } from './current-user';
import { normalizeToCurrentUser } from './normalize-to-current-user';

export const getCurrentUser = (currentUser: unknown, userId?: string | null): CurrentUser => {
  const normalized = normalizeToCurrentUser(currentUser);

  if (normalized) {
    return normalized;
  }

  if (typeof userId === 'string' && userId.length > 0) {
    throw new UnauthorizedContextError('Authenticated user context is incomplete. Re-authenticate and try again.');
  }

  throw new UnauthorizedContextError('Authentication required');
};
