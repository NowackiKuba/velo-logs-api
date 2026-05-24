import { ProjectSlugAlreadyExistsError } from '@/application/projects/errors/conflict.error';
import { ProjectNotFoundError } from '@/application/projects/errors/not-found.error';
import { Project } from '@/domain/projects/entities/project';
import { ProjectRepositoryPort } from '@/domain/projects/repositories/project.repository.port';
import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';
import { ProjectSlug } from '@/domain/projects/value-objects/project/project-slug.vo';

export interface UpdateProjectCommand {
  projectId: string;
  name?: string;
  slug?: string;
  color?: string;
  description?: string | null;
}

export class UpdateProjectUseCase {
  constructor(private readonly projectRepo: ProjectRepositoryPort) {}

  async execute(payload: UpdateProjectCommand): Promise<Project> {
    const project = await this.projectRepo.findById(ProjectId.create(payload.projectId));

    if (!project || project.isDeleted) {
      throw new ProjectNotFoundError(`project with id: ${payload.projectId} not found`);
    }

    if (payload.slug !== undefined) {
      const slug = ProjectSlug.create(payload.slug);
      const existing = await this.projectRepo.findBySlug(slug);

      if (existing && !existing.equals(project)) {
        throw new ProjectSlugAlreadyExistsError(`project slug: ${slug.value} already exists`);
      }
    }

    project.update({
      name: payload.name,
      slug: payload.slug,
      color: payload.color,
      description: payload.description,
    });

    await this.projectRepo.save(project);

    return project;
  }
}
