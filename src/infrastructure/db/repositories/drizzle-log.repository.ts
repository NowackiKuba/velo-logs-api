import { LogFilters, LogRepositoryPort } from '@/domain/logs/repositories/log.repository.port';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../schema';
import { Log } from '@/domain/logs/entities/log.entity';
import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';
import { and, asc, count, desc, eq, ilike } from 'drizzle-orm';
import { paginate, Page } from '@/utils/pagination';

type Database = PostgresJsDatabase<typeof schema>;

const LOG_ORDER_FIELDS = {
  createdAt: schema.logsTable.createdAt,
  level: schema.logsTable.level,
  service: schema.logsTable.service,
} as const;

export class DrizzleLogRepository implements LogRepositoryPort {
  constructor(private readonly db: Database) {}

  async save(log: Log): Promise<void> {
    const row = this.toEntity(log);

    await this.db.insert(schema.logsTable).values(row);
  }

  async findByProjectId(projectId: ProjectId, filters?: LogFilters): Promise<Page<Log>> {
    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;
    const orderField = filters?.orderByField ?? 'createdAt';
    const orderColumn = LOG_ORDER_FIELDS[orderField as keyof typeof LOG_ORDER_FIELDS] ?? LOG_ORDER_FIELDS.createdAt;
    const orderFn = filters?.orderBy === 'asc' ? asc : desc;

    const conditions = and(
      eq(schema.logsTable.projectId, projectId.value),
      filters?.environment ? eq(schema.logsTable.environment, filters.environment.toLowerCase()) : undefined,
      filters?.level ? eq(schema.logsTable.level, filters.level) : undefined,
      filters?.service ? eq(schema.logsTable.service, filters.service) : undefined,
      filters?.search ? ilike(schema.logsTable.message, `%${filters.search}%`) : undefined,
    );

    const totalCountResult = await this.db.select({ count: count() }).from(schema.logsTable).where(conditions);
    const totalCount = totalCountResult[0]?.count ?? 0;

    const rows = await this.db
      .select()
      .from(schema.logsTable)
      .where(conditions)
      .orderBy(orderFn(orderColumn))
      .limit(limit)
      .offset(offset);

    return paginate(
      rows.map((row) => this.toDomain(row)),
      { limit, offset, totalCount },
    );
  }

  private toDomain(entity: schema.DbLog): Log {
    return Log.reconstitute({
      id: entity.id,
      projectId: entity.projectId,
      service: entity.service,
      environment: entity.environment,
      level: entity.level,
      message: entity.message,
      meta: (entity.meta ?? {}) as Record<string, unknown>,
      createdAt: entity.createdAt,
    });
  }

  private toEntity(domain: Log): schema.DbNewLog {
    const data = domain.toJSON();

    return {
      id: data.id,
      projectId: data.projectId,
      service: data.service,
      environment: data.environment.toLowerCase(),
      level: data.level,
      message: data.message,
      meta: data.meta,
      createdAt: data.createdAt,
    };
  }
}
