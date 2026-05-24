import type { User } from '@/domain/users/entities/user';
import type { CurrentUser } from './current-user';
import { toCurrentUser } from './to-current-user';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

export const isCurrentUser = (value: unknown): value is CurrentUser => {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.id === 'string' && value.id.length > 0 && typeof value.username === 'string' && typeof value.email === 'string';
};

const isDomainUser = (value: unknown): value is User => {
  if (!isRecord(value) || !('id' in value)) {
    return false;
  }

  const id = value.id;

  return isRecord(id) && typeof id.value === 'string' && id.value.length > 0;
};

export const normalizeToCurrentUser = (value: unknown): CurrentUser | null => {
  if (isCurrentUser(value)) {
    return value;
  }

  if (isDomainUser(value)) {
    return toCurrentUser(value);
  }

  return null;
};
