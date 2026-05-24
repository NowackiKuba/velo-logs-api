import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';
import { LogEnvType, LogEnvironment } from '../value-objects/log-env.vo';
import { LogId } from '../value-objects/log-id.vo';
import { LogLevel, LogLevelType } from '../value-objects/log-level.vo';

export type LogProps = {
  id?: string;
  projectId: string;
  service: string;
  environment: string;
  level: string;
  message: string;
  meta: Record<string, any>;
  createdAt?: Date;
};

export type LogJSON = {
  id: string;
  projectId: string;
  service: string;
  environment: LogEnvType;
  level: LogLevelType;
  message: string;
  meta: Record<string, any>;
  createdAt: Date;
};

export class Log {
  private _id: LogId;
  private _projectId: ProjectId;
  private _service: string;
  private _environment: LogEnvironment;
  private _level: LogLevel;
  private _message: string;
  private _meta: Record<string, any>;
  private _createdAt: Date;

  private constructor(props: LogProps) {
    this._id = props.id ? LogId.create(props.id) : LogId.generate();
    this._projectId = ProjectId.create(props.projectId);
    this._service = props.service;
    this._environment = LogEnvironment.create(props.environment);
    this._level = LogLevel.create(props.level);
    this._message = props.message;
    this._meta = props.meta;
    this._createdAt = props.createdAt ?? new Date();
  }

  static create(props: LogProps) {
    return new Log(props);
  }

  static reconstitute(props: {
    id: string;
    projectId: string;
    service: string;
    environment: string;
    level: string;
    message: string;
    meta: Record<string, any>;
    createdAt: Date;
  }) {
    return new Log(props);
  }
  get id(): LogId {
    return this._id;
  }
  get projectId(): ProjectId {
    return this._projectId;
  }
  get service(): string {
    return this._service;
  }
  get environment(): LogEnvironment {
    return this._environment;
  }
  get level(): LogLevel {
    return this._level;
  }
  get message(): string {
    return this._message;
  }
  get meta(): Record<string, any> {
    return this._meta;
  }
  get createdAt(): Date {
    return this._createdAt;
  }

  toJSON(): LogJSON {
    return {
      id: this._id.value,
      projectId: this._projectId.value,
      service: this._service,
      environment: this._environment.value,
      level: this._level.value,
      message: this._message,
      meta: this._meta,
      createdAt: this._createdAt,
    };
  }
}
