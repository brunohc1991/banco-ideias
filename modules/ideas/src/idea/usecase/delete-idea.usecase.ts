import { DomainError, UseCase } from "@ideias/shared";
import { ProcessingRepository } from "../../processing/provider";
import { IdeaRepository } from "../provider";

export interface DeleteIdeaIn {
  id: string;
  userId: string;
}

export class DeleteIdea implements UseCase<DeleteIdeaIn, void> {
  constructor(
    private readonly ideaRepository: IdeaRepository,
    private readonly processingRepository: ProcessingRepository,
  ) {}

  async execute(input: DeleteIdeaIn): Promise<void> {
    const existing = await this.ideaRepository.findById(input.id);

    if (!existing) {
      throw new DomainError("idea.not_found", 404);
    }

    if (existing.userId !== input.userId) {
      throw new DomainError("idea.forbidden", 403);
    }

    if (await this.processingRepository.existsByIdeaId(input.id)) {
      throw new DomainError("idea.has_processings", 409);
    }

    await this.ideaRepository.delete(input.id);
  }
}
