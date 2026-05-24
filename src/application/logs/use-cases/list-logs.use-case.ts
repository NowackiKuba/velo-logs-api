import { ProjectNotFoundError } from '@/application/projects/errors/not-found.error';
import { ActiveProjectNotSetError } from '@/application/user/errors/active-project-not-set.error';
import { LogFilters, LogRepositoryPort } from '@/domain/logs/repositories/log.repository.port';
import { Log } from '@/domain/logs/entities/log.entity';
import { ProjectMemberRepositoryPort } from '@/domain/projects/repositories/project-member.repository.port';
import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';
import { UserId } from '@/domain/users/value-objects';
import { Page } from '@/utils/pagination';

export interface ListLogsCommand {
  userId: string;
  projectId?: string;
  filters?: LogFilters;
}

export class ListLogsUseCase {
  constructor(
    private readonly logRepo: LogRepositoryPort,
    private readonly memberRepo: ProjectMemberRepositoryPort,
  ) {}

  async execute(payload: ListLogsCommand): Promise<Page<Log>> {
    if (!payload.projectId) {
      throw new ActiveProjectNotSetError('No active project set. Provide projectId or set an active project.');
    }

    const userId = UserId.create(payload.userId);
    const projectId = ProjectId.create(payload.projectId);

    const members = await this.memberRepo.getByProjectId(projectId, { limit: 100, offset: 0 });
    const isActiveMember = members.data.some(
      (member) => !member.isDeleted && member.userId.value === userId.value && member.status.value === 'ACTIVE',
    );

    if (!isActiveMember) {
      throw new ProjectNotFoundError(`project with id: ${projectId.value} not found`);
    }

    return this.logRepo.findByProjectId(projectId, payload.filters);
  }
}
