import { PageResult } from "@ideias/shared";
import { countByCreatedDay } from "./daily-count.util";
import {
  DailyCount,
  IdeaSearchItem,
  IdeaSearchParams,
  Processing,
  ProcessingIteration,
  ProcessingPageParams,
  ProcessingRepository,
  ProcessingSummary,
} from "../../src";

export interface SearchableIdea extends IdeaSearchItem {
  userId: string;
  updatedAt: Date;
}

export class FakeProcessingRepository implements ProcessingRepository {
  private readonly storage = new Map<string, Processing>();

  constructor(
    initialProcessings: Processing[] = [],
    private readonly searchableIdeas: SearchableIdea[] = [],
  ) {
    for (const processing of initialProcessings) {
      this.storage.set(processing.id, processing);
    }
  }

  get processings(): Processing[] {
    return Array.from(this.storage.values());
  }

  async create(data: Processing): Promise<Processing> {
    this.storage.set(data.id, data);
    return data;
  }

  async appendIteration(
    processingId: string,
    iteration: ProcessingIteration,
  ): Promise<ProcessingIteration> {
    const existing = this.storage.get(processingId);

    if (!existing) {
      throw new Error(`Processing with id "${processingId}" was not found.`);
    }

    this.storage.set(
      processingId,
      existing.clone({ iterations: [...existing.iterations, iteration] }),
    );

    return iteration;
  }

  async delete(id: string): Promise<void> {
    this.storage.delete(id);
  }

  async findById(id: string): Promise<Processing | null> {
    return this.storage.get(id) ?? null;
  }

  async findPage(params: ProcessingPageParams): Promise<PageResult<ProcessingSummary>> {
    const page = Math.max(params.page, 1);
    const perPage = Math.max(params.perPage, 1);
    const owned = this.processings
      .filter((item) => item.userId === params.userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    const start = (page - 1) * perPage;

    return {
      items: owned.slice(start, start + perPage).map((item) => ({
        id: item.id,
        ideaId: item.ideaId,
        ideaName: item.ideaName,
        ideaTypeName: item.ideaTypeName,
        iterationsCount: item.iterations.length,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      page,
      perPage,
      total: owned.length,
    };
  }

  async searchIdeas(params: IdeaSearchParams): Promise<IdeaSearchItem[]> {
    const term = params.term.trim().toLowerCase();

    return this.searchableIdeas
      .filter((item) => item.userId === params.userId)
      .filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.ideaTypeName.toLowerCase().includes(term),
      )
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 20)
      .map(({ id, name, ideaTypeId, ideaTypeName }) => ({ id, name, ideaTypeId, ideaTypeName }));
  }

  async existsByIdeaId(ideaId: string): Promise<boolean> {
    return this.processings.some((item) => item.ideaId === ideaId);
  }

  async countByUser(userId: string): Promise<number> {
    return this.processings.filter((item) => item.userId === userId).length;
  }

  async countDailyByUser(userId: string, days: number): Promise<DailyCount[]> {
    return countByCreatedDay(
      this.processings.filter((item) => item.userId === userId),
      days,
    );
  }
}
