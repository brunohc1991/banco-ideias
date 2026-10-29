import { UseCase } from "@ideias/shared";
import { DEFAULT_IDEA_TYPES } from "../constant";
import { IdeaType } from "../model";
import { IdeaTypeRepository } from "../provider";

export interface LoadDefaultIdeaTypesIn {
  userId: string;
}

export interface LoadDefaultIdeaTypesOut {
  loaded: number;
}

export class LoadDefaultIdeaTypes
  implements UseCase<LoadDefaultIdeaTypesIn, LoadDefaultIdeaTypesOut>
{
  constructor(private readonly ideaTypeRepository: IdeaTypeRepository) {}

  async execute(input: LoadDefaultIdeaTypesIn): Promise<LoadDefaultIdeaTypesOut> {
    const { total } = await this.ideaTypeRepository.findPage({
      userId: input.userId,
      page: 1,
      perPage: 1,
    });

    if (total > 0) {
      return { loaded: 0 };
    }

    const ideaTypes = DEFAULT_IDEA_TYPES.map(
      (item) => new IdeaType({ ...item, userId: input.userId }),
    );

    ideaTypes.forEach((ideaType) => ideaType.validate());

    for (const ideaType of ideaTypes) {
      await this.ideaTypeRepository.create(ideaType);
    }

    return { loaded: ideaTypes.length };
  }
}
