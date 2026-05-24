import { BaseAggregateRoot } from '@/domain/base';
import { ProjectId } from '../value-objects/project/project-id.vo';
import { ProjectColor } from '../value-objects/project/project-color.vo';
import { ProjectName } from '../value-objects/project/project-name.vo';
import { ProjectSlug } from '../value-objects/project/project-slug.vo';
import { ProjectDescription } from '../value-objects/project/project-description.vo';

export type ProjectProps = {
  id?: string;
  name: string;
  slug: string;
  color: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
};

export type ProjectJSON = {
  id: string;
  name: string;
  slug: string;
  color: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

export class Project extends BaseAggregateRoot<ProjectId> {
  private _name: ProjectName;
  private _slug: ProjectSlug;
  private _color: ProjectColor;
  private _description?: ProjectDescription;

  private constructor(props: ProjectProps) {
    const id = props.id ? ProjectId.create(props.id) : ProjectId.generate();
    super(id, props.createdAt ?? new Date(), props.updatedAt ?? new Date(), props.deletedAt);

    this._name = ProjectName.create(props.name);
    this._slug = ProjectSlug.create(props.slug);
    this._color = ProjectColor.create(props.color);
    this._description = props.description ? ProjectDescription.create(props.description) : undefined;
  }

  static create(props: ProjectProps) {
    return new Project(props);
  }

  static reconstitute(props: {
    id: string;
    name: string;
    slug: string;
    color: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
  }) {
    return new Project(props);
  }

  update(props: Partial<Pick<ProjectProps, 'color' | 'name' | 'slug'>> & { description?: string | null }) {
    if (props.color !== undefined) {
      this._color = ProjectColor.create(props.color);
    }
    if (props.name !== undefined) {
      this._name = ProjectName.create(props.name);
    }
    if (props.slug !== undefined) {
      this._slug = ProjectSlug.create(props.slug);
    }
    if (props.description !== undefined) {
      this._description = props.description === null ? undefined : ProjectDescription.create(props.description);
    }

    this.touch();
  }

  get name(): ProjectName {
    return this._name;
  }
  get slug(): ProjectSlug {
    return this._slug;
  }
  get color(): ProjectColor {
    return this._color;
  }
  get description(): ProjectDescription | undefined {
    return this._description;
  }

  toJSON(): ProjectJSON {
    return {
      id: this._id.value,
      name: this._name.value,
      slug: this._slug.value,
      color: this._color.value,
      description: this._description?.value,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      deletedAt: this._deletedAt ?? undefined,
    };
  }
}
