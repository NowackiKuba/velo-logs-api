import { BaseFilters, Page } from '@/utils/pagination';
import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';
import { Log } from '../entities/log.entity';
import { LogLevelType } from '../value-objects/log-level.vo';
import { LogEnvType } from '../value-objects/log-env.vo';

export type LogFilters = BaseFilters & {
  environment?: LogEnvType;
  level?: LogLevelType;
  service?: string;
  search?: string;
};

export interface LogRepositoryPort {
  save(log: Log): Promise<void>;
  findByProjectId(projectId: ProjectId, filters?: LogFilters): Promise<Page<Log>>;
}
