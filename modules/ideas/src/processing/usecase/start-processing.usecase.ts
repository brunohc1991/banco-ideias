import { DomainError, UseCase } from "@ideias/shared";
import { IdeaTypeRepository } from "../../idea-type";
import { IdeaRepository } from "../../idea";
import { Processing, ProcessingIteration } from "../model";
import { AiProvider, ProcessingRepository } from "../provider";
import { composeFirstPrompt } from "../util";

export interface StartProcessingIn {
  ideaId: string;
  userId: string;
}

export class StartProcessing implements UseCase<StartProcessingIn, Processing> {
  constructor(
    private readonly ideaRepository: IdeaRepository,
    private readonly ideaTypeRepository: IdeaTypeRepository,
    private readonly processingRepository: ProcessingRepository,
    private readonly aiProvider: AiProvider,
  ) {}

  async execute(input: StartProcessingIn): Promise<Processing> {
    const idea = await this.ideaRepository.findById(input.ideaId);

    if (!idea || idea.userId !== input.userId) {
      throw new DomainError("processing.idea.invalid", 422);
    }

    const ideaType = await this.ideaTypeRepository.findById(idea.ideaTypeId);

    if (!ideaType) {
      throw new DomainError("processing.idea.invalid", 422);
    }

    const snapshot = {
      userId: input.userId,
      ideaId: idea.id,
      ideaName: idea.name,
      ideaDescription: idea.description,
      ideaObjective: idea.objective,
      ideaTypeId: ideaType.id,
      ideaTypeName: ideaType.name,
      promptTemplate: ideaType.prompt,
      resources: idea.resources.map((resource) => ({
        type: resource.type,
        content: resource.content,
        position: resource.position,
      })),
    };

    const result = await this.aiProvider.generate(
      composeFirstPrompt(snapshot),
    );

    const processing = new Processing({
      ...snapshot,
      iterations: [new ProcessingIteration({ refinement: null, result, position: 0 })],
    });

    processing.validate();

    return this.processingRepository.create(processing);
  }
}
