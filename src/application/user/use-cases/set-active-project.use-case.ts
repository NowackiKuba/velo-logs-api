import { ProjectNotFoundError } from '@/application/projects/errors/not-found.error';
import { UserNotFoundError } from '@/application/user/errors/not-found.error';
import { ProjectMemberRepositoryPort } from '@/domain/projects/repositories/project-member.repository.port';
import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';
import { UserRepositoryPort } from '@/domain/users/repositories/user.repository.port';
import { UserId } from '@/domain/users/value-objects';
import type { CurrentUser } from '@/presentation/http/types/current-user';
import { toCurrentUser } from '@/presentation/http/types/to-current-user';

export class SetActiveProjectUseCase {
  constructor(
    private readonly userRepo: UserRepositoryPort,
    private readonly memberRepo: ProjectMemberRepositoryPort,
  ) {}

  async execute(userId: string, projectId: string): Promise<CurrentUser> {
    const user = await this.userRepo.findById(UserId.create(userId));

    if (!user) {
      throw new UserNotFoundError(`user with id: ${userId} not found`);
    }

    const pid = ProjectId.create(projectId);
    const members = await this.memberRepo.getByProjectId(pid, { limit: 100, offset: 0 });
    const isActiveMember = members.data.some(
      (member) =>
        !member.isDeleted && member.userId.value === userId && member.status.value === 'ACTIVE',
    );

    if (!isActiveMember) {
      throw new ProjectNotFoundError(`project with id: ${projectId} not found`);
    }

    user.updateActiveProject(projectId);
    const saved = await this.userRepo.save(user);

    return toCurrentUser(saved);
  }
}
