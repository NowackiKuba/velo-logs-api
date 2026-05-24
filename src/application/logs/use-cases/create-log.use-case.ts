import { ApiKeyEnvType } from '@/domain/api-keys/value-objects/api-key-env.vo';
import { Log } from '@/domain/logs/entities/log.entity';
import { LogRepositoryPort } from '@/domain/logs/repositories/log.repository.port';
import { LogEnvType } from '@/domain/logs/value-objects/log-env.vo';

const API_KEY_ENV_TO_LOG_ENV: Record<ApiKeyEnvType, LogEnvType> = {
  PRODUCTION: 'PRODUCTION',
  STAGING: 'STAGING',
  DEVELOPMENT: 'DEVELOPMENT',
};

export interface CreateLogCommand {
  projectId: string;
  apiKeyEnv: ApiKeyEnvType;
  service: string;
  environment?: string;
  level: string;
  message: string;
  meta?: Record<string, unknown>;
}

export class CreateLogUseCase {
  constructor(private readonly logRepo: LogRepositoryPort) {}

  async execute(payload: CreateLogCommand): Promise<{ logId: string }> {
    const log = Log.create({
      projectId: payload.projectId,
      service: payload.service,
      environment: payload.environment ?? API_KEY_ENV_TO_LOG_ENV[payload.apiKeyEnv],
      level: payload.level,
      message: payload.message,
      meta: payload.meta ?? {},
    });

    await this.logRepo.save(log);

    return { logId: log.id.value };
  }
}
