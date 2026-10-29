import {
  DomainError,
  MaxLengthRule,
  MinLengthRule,
  RequiredRule,
  UseCase,
  Validator,
} from "@ideias/shared";
import {
  MAX_PROCESSING_ITERATIONS,
  MAX_REFINEMENT_LENGTH,
  MIN_REFINEMENT_LENGTH,
  ProcessingIteration,
} from "../model";
import { AiProvider, ProcessingRepository } from "../provider";
import { composeRefinementPrompt } from "../util";

export interface RefineProcessingIn {
  id: string;
  userId: string;
  refinement: string;
}

export class RefineProcessing
  implements UseCase<RefineProcessingIn, ProcessingIteration>
{
  constructor(
    private readonly processingRepository: ProcessingRepository,
    private readonly aiProvider: AiProvider,
  ) {}

  async execute(input: RefineProcessingIn): Promise<ProcessingIteration> {
    const processing = await this.processingRepository.findById(input.id);

    if (!processing || processing.userId !== input.userId) {
      throw new DomainError("processing.not_found", 404);
    }

    Validator.validate([
      {
        code: "processing.refinement",
        value: input.refinement,
        rules: [
          new RequiredRule(),
          new MinLengthRule(MIN_REFINEMENT_LENGTH),
          new MaxLengthRule(MAX_REFINEMENT_LENGTH),
        ],
      },
    ]);

    if (processing.iterations.length >= MAX_PROCESSING_ITERATIONS) {
      throw new DomainError("processing.iterations.too_many", 422);
    }

    const result = await this.aiProvider.generate(
      composeRefinementPrompt(processing, processing.iterations, input.refinement),
    );

    const iteration = new ProcessingIteration({
      refinement: input.refinement,
      result,
      position: processing.iterations.length,
    });

    iteration.validate();

    return this.processingRepository.appendIteration(processing.id, iteration);
  }
}
