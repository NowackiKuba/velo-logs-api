import type { User } from '@/domain/users/entities/user';
import type { CurrentUser } from './current-user';

export const toCurrentUser = (user: User): CurrentUser => ({
  id: user.id.value,
  username: user.username.value,
  email: user.email.value,
  activeProjectId: user.activeProjectId?.value,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
