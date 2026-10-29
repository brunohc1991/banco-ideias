import { PageResult } from "@ideias/shared";
import { DailyCount, DashboardIdeaSummary, Idea, IdeaPageParams, IdeaRepository } from "../../src";
import { countByCreatedDay } from "./daily-count.util";

export class FakeIdeaRepository implements IdeaRepository {
  private readonly storage = new Map<string, Idea>();

  constructor(
    initialIdeas: Idea[] = [],
    private readonly ideaTypeNames: Record<string, string> = {},
  ) {
    for (const idea of initialIdeas) {
      this.storage.set(idea.id, idea);
    }
  }

  get ideas(): Idea[] {
    return Array.from(this.storage.values());
  }

  async create(data: Idea): Promise<Idea> {
    this.storage.set(data.id, data);
    return data;
  }

  async update(data: Idea): Promise<Idea> {
    if (!this.storage.has(data.id)) {
      throw new Error(`Idea with id "${data.id}" was not found.`);
    }

    this.storage.set(data.id, data);
    return data;
  }

  async delete(id: string): Promise<void> {
    this.storage.delete(id);
  }

  async findById(id: string): Promise<Idea | null> {
    const idea = this.storage.get(id);

    if (!idea) {
      return null;
    }

    return idea.clone({
      resources: [...idea.resources].sort((a, b) => a.position - b.position),
      updatedAt: idea.updatedAt,
    });
  }

  async findPage(params: IdeaPageParams): Promise<PageResult<Idea>> {
    const page = Math.max(params.page, 1);
    const perPage = Math.max(params.perPage, 1);
    const owned = this.ideas.filter((item) => item.userId === params.userId);
    const start = (page - 1) * perPage;

    return {
      items: owned
        .slice(start, start + perPage)
        .map((item) => item.clone({ resources: [], updatedAt: item.updatedAt })),
      page,
      perPage,
      total: owned.length,
    };
  }

  private active(userId: string): Idea[] {
    return this.ideas.filter((item) => item.userId === userId && item.deletedAt === null);
  }

  async countByUser(userId: string): Promise<number> {
    return this.active(userId).length;
  }

  async findLatestByUser(userId: string, limit: number): Promise<DashboardIdeaSummary[]> {
    return this.active(userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit)
      .map((item) => ({
        id: item.id,
        name: item.name,
        ideaTypeId: item.ideaTypeId,
        ideaTypeName: this.ideaTypeNames[item.ideaTypeId] ?? "",
        updatedAt: item.updatedAt,
      }));
  }

  async countDailyByUser(userId: string, days: number): Promise<DailyCount[]> {
    return countByCreatedDay(this.active(userId), days);
  }
}
