import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import {
  DailyCount,
  DashboardIdeaSummary,
  Idea,
  IdeaPageParams,
  IdeaRepository,
  Resource,
  ResourceType,
} from '@ideias/ideas';
import { PageResult } from '@ideias/shared';
import {
  Idea as PrismaIdea,
  Prisma,
  Resource as PrismaResource,
} from '@prisma/client';
import { PrismaService } from '../../db/prisma.service';
import { startOfUtcWindow } from './daily-window.util';

const RESOURCE_ORDER: Prisma.ResourceOrderByWithRelationInput[] = [
  { position: 'asc' },
  { createdAt: 'asc' },
];

@Injectable()
export class PrismaIdeaRepository implements IdeaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Idea): Promise<Idea> {
    return this.prisma.$transaction(async (tx) => {
      await tx.idea.create({ data: this.toPersistence(data) });
      await this.reconcileResources(tx, data);

      return this.loadIdea(tx, data.id);
    });
  }

  async update(data: Idea): Promise<Idea> {
    return this.prisma.$transaction(async (tx) => {
      await tx.idea.update({
        where: { id: data.id },
        data: this.toPersistence(data),
      });
      await this.reconcileResources(tx, data);

      return this.loadIdea(tx, data.id);
    });
  }

  // Exclusão lógica da Ideia; os recursos não têm exclusão lógica e saem junto.
  async delete(id: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.resource.deleteMany({ where: { ideaId: id } }),
      this.prisma.idea.update({
        where: { id },
        data: { deletedAt: new Date() },
      }),
    ]);
  }

  async findById(id: string): Promise<Idea | null> {
    const found = await this.prisma.idea.findFirst({
      where: { id, deletedAt: null },
      include: { resources: { orderBy: RESOURCE_ORDER } },
    });

    return found ? this.toDomain(found, found.resources) : null;
  }

  async countByUser(userId: string): Promise<number> {
    return this.prisma.idea.count({ where: { userId, deletedAt: null } });
  }

  async findLatestByUser(
    userId: string,
    limit: number,
  ): Promise<DashboardIdeaSummary[]> {
    const ideas = await this.prisma.idea.findMany({
      where: { userId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: { ideaType: { select: { name: true } } },
    });

    return ideas.map((idea) => ({
      id: idea.id,
      name: idea.name,
      ideaTypeId: idea.ideaTypeId,
      ideaTypeName: idea.ideaType.name,
      updatedAt: idea.updatedAt,
    }));
  }

  // Agrupa pela data de criação em UTC, restrito ao usuário e à janela de `days` dias.
  async countDailyByUser(userId: string, days: number): Promise<DailyCount[]> {
    const since = startOfUtcWindow(days);
    const rows = await this.prisma.$queryRaw<{ date: string; count: number }[]>`
      SELECT to_char("createdAt", 'YYYY-MM-DD') AS date, COUNT(*)::int AS count
      FROM "ideas"
      WHERE "userId" = ${userId} AND "deletedAt" IS NULL AND "createdAt" >= ${since}
      GROUP BY 1`;

    return rows.map((row) => ({ date: row.date, count: row.count }));
  }

  async findPage(params: IdeaPageParams): Promise<PageResult<Idea>> {
    const page = Math.max(params.page, 1);
    const perPage = Math.max(params.perPage, 1);
    const skip = (page - 1) * perPage;
    const where = { userId: params.userId, deletedAt: null };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.idea.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.idea.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toDomain(item)),
      page,
      perPage,
      total,
    };
  }

  // Substituição restrita ao `ideaId`: remove o que não veio, atualiza o que já
  // pertence à Ideia e cria o resto. Um id de outra Ideia vira recurso novo.
  private async reconcileResources(
    tx: Prisma.TransactionClient,
    idea: Idea,
  ): Promise<void> {
    const incoming = idea.resources;
    const owned = await tx.resource.findMany({
      where: { ideaId: idea.id },
      select: { id: true },
    });
    const ownedIds = new Set(owned.map((item) => item.id));
    const incomingIds = incoming.map((item) => item.id);

    await tx.resource.deleteMany({
      where: { ideaId: idea.id, id: { notIn: incomingIds } },
    });

    const taken = await tx.resource.findMany({
      where: { id: { in: incomingIds.filter((id) => !ownedIds.has(id)) } },
      select: { id: true },
    });
    const takenIds = new Set(taken.map((item) => item.id));

    for (const resource of incoming) {
      if (ownedIds.has(resource.id)) {
        await tx.resource.update({
          where: { id: resource.id },
          data: {
            type: resource.type,
            content: resource.content,
            position: resource.position,
            updatedAt: resource.updatedAt,
          },
        });
        continue;
      }

      await tx.resource.create({
        data: {
          id: takenIds.has(resource.id) ? randomUUID() : resource.id,
          ideaId: idea.id,
          type: resource.type,
          content: resource.content,
          position: resource.position,
          createdAt: resource.createdAt,
          updatedAt: resource.updatedAt,
        },
      });
    }
  }

  private async loadIdea(
    tx: Prisma.TransactionClient,
    id: string,
  ): Promise<Idea> {
    const found = await tx.idea.findUniqueOrThrow({
      where: { id },
      include: { resources: { orderBy: RESOURCE_ORDER } },
    });

    return this.toDomain(found, found.resources);
  }

  private toPersistence(idea: Idea) {
    return {
      id: idea.id,
      name: idea.name,
      description: idea.description,
      objective: idea.objective,
      ideaTypeId: idea.ideaTypeId,
      userId: idea.userId,
      createdAt: idea.createdAt,
      updatedAt: idea.updatedAt,
      deletedAt: idea.deletedAt,
    };
  }

  private toDomain(raw: PrismaIdea, resources: PrismaResource[] = []): Idea {
    return new Idea({
      id: raw.id,
      name: raw.name,
      description: raw.description,
      objective: raw.objective,
      ideaTypeId: raw.ideaTypeId,
      userId: raw.userId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      resources: resources.map(
        (item) =>
          new Resource({
            id: item.id,
            type: item.type as ResourceType,
            content: item.content,
            position: item.position,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          }),
      ),
    });
  }
}
