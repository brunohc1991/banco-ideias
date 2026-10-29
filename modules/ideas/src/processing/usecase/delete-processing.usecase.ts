import { DomainError, UseCase } from "@ideias/shared";
import { ProcessingRepository } from "../provider";

export interface DeleteProcessingIn {
  id: string;
  userId: string;
}

export class DeleteProcessing implements UseCase<DeleteProcessingIn, void> {
  constructor(private readonly processingRepository: ProcessingRepository) {}

  async execute(input: DeleteProcessingIn): Promise<void> {
    const existing = await this.processingRepository.findById(input.id);

    if (!existing || existing.userId !== input.userId) {
      throw new DomainError("processing.not_found", 404);
    }

    await this.processingRepository.delete(input.id);
  }
}
