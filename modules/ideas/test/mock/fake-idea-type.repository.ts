import { PageResult } from "@ideias/shared";
import { IdeaType, IdeaTypePageParams, IdeaTypeRepository } from "../../src";

export class FakeIdeaTypeRepository implements IdeaTypeRepository {
  private readonly storage = new Map<string, IdeaType>();

  constructor(initialIdeaTypes: IdeaType[] = []) {
    for (const ideaType of initialIdeaTypes) {
      this.storage.set(ideaType.id, ideaType);
    }
  }

  get ideaTypes(): IdeaType[] {
    return Array.from(this.storage.values());
  }

  async create(data: IdeaType): Promise<IdeaType> {
    this.storage.set(data.id, data);
    return data;
  }

  async update(data: IdeaType): Promise<IdeaType> {
    if (!this.storage.has(data.id)) {
      throw new Error(`IdeaType with id "${data.id}" was not found.`);
    }

    this.storage.set(data.id, data);
    return data;
  }

  async delete(id: string): Promise<void> {
    this.storage.delete(id);
  }

  async findById(id: string): Promise<IdeaType | null> {
    return this.storage.get(id) ?? null;
  }

  async findPage(params: IdeaTypePageParams): Promise<PageResult<IdeaType>> {
    const page = Math.max(params.page, 1);
    const perPage = Math.max(params.perPage, 1);
    const owned = this.ideaTypes.filter((item) => item.userId === params.userId);
    const start = (page - 1) * perPage;

    return {
      items: owned.slice(start, start + perPage),
      page,
      perPage,
      total: owned.length,
    };
  }

  async countByUser(userId: string): Promise<number> {
    return this.ideaTypes.filter((item) => item.userId === userId && item.deletedAt === null).length;
  }
}
