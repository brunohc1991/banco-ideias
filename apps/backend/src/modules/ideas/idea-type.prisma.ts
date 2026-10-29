import { Injectable } from '@nestjs/common';
import {
  IdeaType,
  IdeaTypePageParams,
  IdeaTypeRepository,
} from '@ideias/ideas';
import { PageResult } from '@ideias/shared';
import { IdeaType as PrismaIdeaType } from '@prisma/client';
import { PrismaService } from '../../db/prisma.service';

@Injectable()
export class PrismaIdeaTypeRepository implements IdeaTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: IdeaType): Promise<IdeaType> {
    const created = await this.prisma.ideaType.create({
      data: this.toPersistence(data),
    });

    return this.toDomain(created);
  }

  async update(data: IdeaType): Promise<IdeaType> {
    const updated = await this.prisma.ideaType.update({
      where: { id: data.id },
      data: this.toPersistence(data),
    });

    return this.toDomain(updated);
  }

  // Exclusão lógica: o registro permanece no banco com `deletedAt` preenchido.
  async delete(id: string): Promise<void> {
    await this.prisma.ideaType.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findById(id: string): Promise<IdeaType | null> {
    const found = await this.prisma.ideaType.findFirst({
      where: { id, deletedAt: null },
    });

    return found ? this.toDomain(found) : null;
  }

  async countByUser(userId: string): Promise<number> {
    return this.prisma.ideaType.count({ where: { userId, deletedAt: null } });
  }

  async findPage(params: IdeaTypePageParams): Promise<PageResult<IdeaType>> {
    const page = Math.max(params.page, 1);
    const perPage = Math.max(params.perPage, 1);
    const skip = (page - 1) * perPage;
    const where = { userId: params.userId, deletedAt: null };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.ideaType.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.ideaType.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toDomain(item)),
      page,
      perPage,
      total,
    };
  }

  private toPersistence(ideaType: IdeaType) {
    return {
      id: ideaType.id,
      name: ideaType.name,
      description: ideaType.description,
      prompt: ideaType.prompt,
      userId: ideaType.userId,
      createdAt: ideaType.createdAt,
      updatedAt: ideaType.updatedAt,
      deletedAt: ideaType.deletedAt,
    };
  }

  private toDomain(raw: PrismaIdeaType): IdeaType {
    return new IdeaType({
      id: raw.id,
      name: raw.name,
      description: raw.description,
      prompt: raw.prompt,
      userId: raw.userId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }
}
