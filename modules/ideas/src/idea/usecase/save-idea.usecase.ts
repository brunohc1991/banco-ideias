import {
  DomainError,
  UseCase,
  ValidationError,
  ValidationException,
} from "@ideias/shared";
import { IdeaTypeRepository } from "../../idea-type";
import { Idea, RESOURCE_TYPES, Resource, ResourceType } from "../model";
import { IdeaRepository } from "../provider";

export interface SaveIdeaResourceIn {
  id?: string;
  type?: string;
  content: string;
  position: number;
}

export interface SaveIdeaIn {
  id?: string;
  name: string;
  description: string;
  objective: string;
  ideaTypeId: string;
  userId: string;
  resources?: SaveIdeaResourceIn[];
}

export class SaveIdea implements UseCase<SaveIdeaIn, void> {
  constructor(
    private readonly ideaRepository: IdeaRepository,
    private readonly ideaTypeRepository: IdeaTypeRepository,
  ) {}

  async execute(input: SaveIdeaIn): Promise<void> {
    const resources = this.buildResources(input.resources ?? []);
    const draft = new Idea({ ...input, resources });

    draft.validate();

    const ideaType = await this.ideaTypeRepository.findById(input.ideaTypeId);

    if (!ideaType || ideaType.userId !== input.userId) {
      throw new DomainError("idea.ideaType.invalid", 422);
    }

    const existing = input.id
      ? await this.ideaRepository.findById(input.id)
      : null;

    if (!existing) {
      await this.ideaRepository.create(draft);
      return;
    }

    if (existing.userId !== input.userId) {
      throw new DomainError("idea.forbidden", 403);
    }

    await this.ideaRepository.update(
      existing.clone({
        name: input.name,
        description: input.description,
        objective: input.objective,
        ideaTypeId: input.ideaTypeId,
        resources,
      }),
    );
  }

  private buildResources(items: SaveIdeaResourceIn[]): Resource[] {
    const unsupported = items.some(
      (item) =>
        !!item.type && !RESOURCE_TYPES.includes(item.type as ResourceType),
    );

    if (unsupported) {
      throw new ValidationException([
        new ValidationError("idea.resource.type.unsupported"),
      ]);
    }

    return items.map(
      (item) =>
        new Resource({
          id: item.id || undefined,
          type: item.type as ResourceType,
          content: item.content,
          position: item.position,
        }),
    );
  }
}
