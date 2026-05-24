import { ProjectNotFoundError } from '@/application/projects/errors/not-found.error';
import { SecretCipherPort } from '@/application/api-keys/ports/secret-cipher.port';
import { ApiKeyRepositoryPort } from '@/domain/api-keys/repositories/api-key.repository.port';
import { ProjectRepositoryPort } from '@/domain/projects/repositories/project.repository.port';
import { ApiKey } from '@/domain/api-keys/entities/api-key';
import { ApiKeyEnvType } from '@/domain/api-keys/value-objects/api-key-env.vo';
import { ApiKeySecret } from '@/domain/api-keys/value-objects/api-key-secret.vo';
import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';

export interface CreateApiKeyCommand {
  name: string;
  env: ApiKeyEnvType;
  projectId: string;
  expiresAt: Date;
}

export type CreateApiKeyResult = {
  id: string;
  name: string;
  env: ApiKeyEnvType;
  projectId: string;
  secret: string;
  secretPrefix: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export class CreateApiKeyUseCase {
  constructor(
    private readonly apiKeyRepo: ApiKeyRepositoryPort,
    private readonly projectRepo: ProjectRepositoryPort,
    private readonly cipher: SecretCipherPort,
  ) {}

  async execute(payload: CreateApiKeyCommand): Promise<CreateApiKeyResult> {
    const projectId = ProjectId.create(payload.projectId);
    const project = await this.projectRepo.findById(projectId);

    if (!project || project.isDeleted) {
      throw new ProjectNotFoundError(`project with id: ${payload.projectId} not found`);
    }

    const { secret, prefix } = ApiKeySecret.generate();
    const apiKey = ApiKey.create({
      name: payload.name,
      env: payload.env,
      projectId: projectId.value,
      expiresAt: payload.expiresAt,
      secret: secret.value,
      secretPrefix: prefix.value,
    });

    await this.apiKeyRepo.save(
      ApiKey.reconstitute({
        ...apiKey.toJSON(),
        secret: this.cipher.encrypt(secret.value),
      }),
    );

    return {
      id: apiKey.id.value,
      name: apiKey.name.value,
      env: apiKey.env.value,
      projectId: apiKey.projectId.value,
      secret: secret.value,
      secretPrefix: prefix.value,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
      updatedAt: apiKey.updatedAt,
    };
  }
}
