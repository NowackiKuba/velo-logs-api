import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';
import { ApiKey } from '../entities/api-key';
import { ApiKeyId } from '../value-objects/api-key-id.vo';

export interface ApiKeyRepositoryPort {
  save(apiKey: ApiKey): Promise<void>;
  findById(id: ApiKeyId): Promise<ApiKey | null>;
  findByProjectId(projectId: ProjectId): Promise<ApiKey[]>;
}
