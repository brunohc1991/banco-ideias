import { Injectable } from '@nestjs/common';
import {
  DailyCount,
  IdeaSearchItem,
  IdeaSearchParams,
  Processing,
  ProcessingIteration,
  ProcessingPageParams,
  ProcessingRepository,
  ProcessingSummary,
} from '@ideias/ideas';
import { PageResult } from '@ideias/shared';
import {
  Prisma,
  Processing as PrismaProcessing,
  ProcessingIteration as PrismaIteration,
  ProcessingResource as PrismaResource,
} from '@prisma/client';
import { PrismaService } from '../../db/prisma.service';
import { startOfUtcWindow } from './daily-window.util';

const BY_POSITION = { orderBy: { position: 'asc' } } satisfies {
  orderBy: Prisma.ProcessingIterationOrderByWithRelationInput;
};
const DETAIL_INCLUDE = {
  resources: BY_POSITION,
  iterations: BY_POSITION,
} satisfies Prisma.ProcessingInclude;

type ProcessingWithChildren = PrismaProcessing & {
  resources: PrismaResource[];
  iterations: PrismaIteration[];
};

const IDEA_SEARCH_LIMIT = 20;

@Injectable()
export class PrismaProcessingRepository implements ProcessingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Processing): Promise<Processing> {
    const created = await this.prisma.processing.create({
      data: {
        id: data.id,
        userId: data.userId,
        ideaId: data.ideaId,
        ideaName: data.ideaName,
        ideaDescription: data.ideaDescription,
        ideaObjective: data.ideaObjective,
        ideaTypeId: data.ideaTypeId,
        ideaTypeName: data.ideaTypeName,
        promptTemplate: data.promptTemplate,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        resources: {
          create: data.resources.map((resource) => ({
            type: resource.type,
            content: resource.content,
            position: resource.position,
          })),
        },
        iterations: {
          create: data.iterations.map((iteration) => this.toIterationData(iteration)),
        },
      },
      include: DETAIL_INCLUDE,
    });

    return this.toDomain(created);
  }

  // A iteração e o `updatedAt` do Processamento mudam juntos, para a listagem refletir a atividade.
  async appendIteration(
    processingId: string,
    iteration: ProcessingIteration,
  ): Promise<ProcessingIteration> {
    const [created] = await this.prisma.$transaction([
      this.prisma.processingIteration.create({
        data: { processingId, ...this.toIterationData(iteration) },
      }),
      this.prisma.processing.update({
        where: { id: processingId },
        data: { updatedAt: iteration.createdAt },
      }),
    ]);

    return this.toIteration(created);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.processing.delete({ where: { id } });
  }

  async findById(id: string): Promise<Processing | null> {
    const found = await this.prisma.processing.findUnique({
      where: { id },
      include: DETAIL_INCLUDE,
    });

    return found ? this.toDomain(found) : null;
  }

  async findPage(
    params: ProcessingPageParams,
  ): Promise<PageResult<ProcessingSummary>> {
    const page = Math.max(params.page, 1);
    const perPage = Math.max(params.perPage, 1);
    const where = { userId: params.userId };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.processing.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { updatedAt: 'desc' },
        include: { _count: { select: { iterations: true } } },
      }),
      this.prisma.processing.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        ideaId: item.ideaId,
        ideaName: item.ideaName,
        ideaTypeName: item.ideaTypeName,
        iterationsCount: item._count.iterations,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      page,
      perPage,
      total,
    };
  }

  async searchIdeas(params: IdeaSearchParams): Promise<IdeaSearchItem[]> {
    const term = params.term.trim();
    const contains = { contains: term, mode: 'insensitive' } as const;

    const ideas = await this.prisma.idea.findMany({
      where: {
        userId: params.userId,
        deletedAt: null,
        OR: [{ name: contains }, { ideaType: { name: contains } }],
      },
      orderBy: { updatedAt: 'desc' },
      take: IDEA_SEARCH_LIMIT,
      include: { ideaType: { select: { name: true } } },
    });

    return ideas.map((idea) => ({
      id: idea.id,
      name: idea.name,
      ideaTypeId: idea.ideaTypeId,
      ideaTypeName: idea.ideaType.name,
    }));
  }

  async existsByIdeaId(ideaId: string): Promise<boolean> {
    const found = await this.prisma.processing.findFirst({
      where: { ideaId },
      select: { id: true },
    });

    return found !== null;
  }

  async countByUser(userId: string): Promise<number> {
    return this.prisma.processing.count({ where: { userId } });
  }

  async countDailyByUser(userId: string, days: number): Promise<DailyCount[]> {
    const since = startOfUtcWindow(days);
    const rows = await this.prisma.$queryRaw<{ date: string; count: number }[]>`
      SELECT to_char("createdAt", 'YYYY-MM-DD') AS date, COUNT(*)::int AS count
      FROM "processings"
      WHERE "userId" = ${userId} AND "createdAt" >= ${since}
      GROUP BY 1`;

    return rows.map((row) => ({ date: row.date, count: row.count }));
  }

  private toIterationData(iteration: ProcessingIteration) {
    return {
      id: iteration.id,
      refinement: iteration.refinement,
      result: iteration.result,
      position: iteration.position,
      createdAt: iteration.createdAt,
      updatedAt: iteration.updatedAt,
    };
  }

  private toIteration(raw: PrismaIteration): ProcessingIteration {
    return new ProcessingIteration({
      id: raw.id,
      refinement: raw.refinement,
      result: raw.result,
      position: raw.position,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  private toDomain(raw: ProcessingWithChildren): Processing {
    return new Processing({
      id: raw.id,
      userId: raw.userId,
      ideaId: raw.ideaId,
      ideaName: raw.ideaName,
      ideaDescription: raw.ideaDescription,
      ideaObjective: raw.ideaObjective,
      ideaTypeId: raw.ideaTypeId,
      ideaTypeName: raw.ideaTypeName,
      promptTemplate: raw.promptTemplate,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      resources: raw.resources.map((resource) => ({
        type: resource.type,
        content: resource.content,
        position: resource.position,
      })),
      iterations: raw.iterations.map((iteration) => this.toIteration(iteration)),
    });
  }
}
