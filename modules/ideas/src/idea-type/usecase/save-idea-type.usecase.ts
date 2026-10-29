import { DomainError, UseCase } from "@ideias/shared";
import { IdeaType } from "../model";
import { IdeaTypeRepository } from "../provider";

export interface SaveIdeaTypeIn {
  id?: string;
  name: string;
  description: string;
  prompt: string;
  userId: string;
}

export class SaveIdeaType implements UseCase<SaveIdeaTypeIn, void> {
  constructor(private readonly ideaTypeRepository: IdeaTypeRepository) {}

  async execute(input: SaveIdeaTypeIn): Promise<void> {
    const draft = new IdeaType(input);

    draft.validate();

    const existing = input.id
      ? await this.ideaTypeRepository.findById(input.id)
      : null;

    if (!existing) {
      await this.ideaTypeRepository.create(draft);
      return;
    }

    if (existing.userId !== input.userId) {
      throw new DomainError("idea-type.forbidden", 403);
    }

    await this.ideaTypeRepository.update(
      existing.clone({
        name: input.name,
        description: input.description,
        prompt: input.prompt,
      }),
    );
  }
}
