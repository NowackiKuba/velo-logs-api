import { ProjectNotFoundError } from '@/application/projects/errors/not-found.error';
import { ApiKey } from '@/domain/api-keys/entities/api-key';
import { ApiKeyRepositoryPort } from '@/domain/api-keys/repositories/api-key.repository.port';
import { ProjectMemberRepositoryPort } from '@/domain/projects/repositories/project-member.repository.port';
import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';
import { UserId } from '@/domain/users/value-objects';

export interface ListProjectApiKeysCommand {
  userId: string;
  projectId: string;
}

export class ListProjectApiKeysUseCase {
  constructor(
    private readonly apiKeyRepo: ApiKeyRepositoryPort,
    private readonly memberRepo: ProjectMemberRepositoryPort,
  ) {}

  async execute(payload: ListProjectApiKeysCommand): Promise<ApiKey[]> {
    const userId = UserId.create(payload.userId);
    const projectId = ProjectId.create(payload.projectId);

    const members = await this.memberRepo.getByProjectId(projectId, { limit: 100, offset: 0 });
    const isActiveMember = members.data.some(
      (member) => !member.isDeleted && member.userId.value === userId.value && member.status.value === 'ACTIVE',
    );

    if (!isActiveMember) {
      throw new ProjectNotFoundError(`project with id: ${projectId.value} not found`);
    }

    return this.apiKeyRepo.findByProjectId(projectId);
  }
}
