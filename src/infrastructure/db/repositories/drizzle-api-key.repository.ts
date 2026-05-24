import { ApiKeyRepositoryPort } from '@/domain/api-keys/repositories/api-key.repository.port';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../schema';
import { ApiKey } from '@/domain/api-keys/entities/api-key';
import { ApiKeyId } from '@/domain/api-keys/value-objects/api-key-id.vo';
import { DbApiKey } from '../schema/api-keys';
import { eq } from 'drizzle-orm';
import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';
type Database = PostgresJsDatabase<typeof schema>;

export class DrizzleApiKeyRepository implements ApiKeyRepositoryPort {
  constructor(private readonly db: Database) {}

  async findById(id: ApiKeyId): Promise<ApiKey | null> {
    const rows = await this.db.select().from(schema.apiKeysTable).where(eq(schema.apiKeysTable.id, id.value));

    const apiKey = rows[0];

    if (!apiKey) {
      return null;
    }

    return this.toDomain(apiKey);
  }

  async findByProjectId(projectId: ProjectId): Promise<ApiKey[]> {
    const rows = await this.db.select().from(schema.apiKeysTable).where(eq(schema.apiKeysTable.projectId, projectId.value));

    return rows.map((r) => this.toDomain(r));
  }

  async save(apiKey: ApiKey): Promise<void> {
    const row = this.toEntity(apiKey);

    await this.db
      .insert(schema.apiKeysTable)
      .values(row)
      .onConflictDoUpdate({
        target: schema.apiKeysTable.id,
        set: {
          id: row.id,
          name: row.name,
          env: row.env,
          secret: row.secret,
          secretPrefix: row.secretPrefix,
          projectId: row.projectId,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          deletedAt: row.deletedAt,
        },
      });
  }

  toDomain(entity: DbApiKey): ApiKey {
    return ApiKey.reconstitute({
      ...entity,
      deletedAt: entity?.deletedAt ?? undefined,
    });
  }

  toEntity(domain: ApiKey): DbApiKey {
    const data = domain.toJSON();

    return {
      ...data,
      deletedAt: data.deletedAt ?? null,
    };
  }
}
