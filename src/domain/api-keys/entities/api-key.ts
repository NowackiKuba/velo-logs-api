import { BaseAggregateRoot } from '@/domain/base';
import { ApiKeyEnv, ApiKeyEnvType } from '../value-objects/api-key-env.vo';
import { ApiKeyId } from '../value-objects/api-key-id.vo';
import { ApiKeyName } from '../value-objects/api-key-name.vo';
import { ApiKeySecret } from '../value-objects/api-key-secret.vo';
import { ApiKeySecretPrefix } from '../value-objects/api-key-secret-prefix.vo';
import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';

export type ApiKeyProps = {
  id?: string;
  name: string;
  env: string;
  projectId: string;
  secret: string;
  secretPrefix: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
};

export type ApiKeyJSON = {
  id: string;
  name: string;
  env: ApiKeyEnvType;
  projectId: string;
  secret: string;
  secretPrefix: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

export class ApiKey extends BaseAggregateRoot<ApiKeyId> {
  private _name: ApiKeyName;
  private _env: ApiKeyEnv;
  private _projectId: ProjectId;
  private _secret: ApiKeySecret;
  private _expiresAt: Date;
  private _secretPrefix: ApiKeySecretPrefix;

  private constructor(props: ApiKeyProps, options?: { persisted?: boolean }) {
    const id = props?.id ? ApiKeyId.create(props.id) : ApiKeyId.generate();
    super(id, props?.createdAt ?? new Date(), props.updatedAt ?? new Date(), props.deletedAt);
    this._name = ApiKeyName.create(props.name);
    this._env = ApiKeyEnv.create(props.env);
    this._projectId = ProjectId.create(props.projectId);
    this._secret = options?.persisted ? ApiKeySecret.reconstitute(props.secret) : ApiKeySecret.create(props.secret);
    this._secretPrefix = ApiKeySecretPrefix.create(props.secretPrefix);
    this._expiresAt = props.expiresAt;
  }

  static create(props: ApiKeyProps) {
    return new ApiKey(props);
  }

  static reconstitute(props: {
    id: string;
    name: string;
    env: string;
    projectId: string;
    secret: string;
    secretPrefix: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
  }) {
    return new ApiKey(props, { persisted: true });
  }

  get name(): ApiKeyName {
    return this._name;
  }
  get env(): ApiKeyEnv {
    return this._env;
  }
  get projectId(): ProjectId {
    return this._projectId;
  }
  get secret(): ApiKeySecret {
    return this._secret;
  }
  get secretPrefix(): ApiKeySecretPrefix {
    return this._secretPrefix;
  }
  get expiresAt(): Date {
    return this._expiresAt;
  }

  toJSON(): ApiKeyJSON {
    return {
      id: this._id.value,
      name: this._name.value,
      env: this._env.value,
      projectId: this._projectId.value,
      expiresAt: this._expiresAt,
      secret: this._secret.value,
      secretPrefix: this._secretPrefix.value,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      deletedAt: this._deletedAt ?? undefined,
    };
  }
}
