import { Controller, Get, Query } from '@nestjs/common';
import {
  LoadDashboardSummary,
  type DashboardActivityPoint,
  type DashboardStats,
} from '@ideias/ideas';
import { CurrentUser } from '../../shared/decorators';
import { PrismaIdeaTypeRepository } from './idea-type.prisma';
import { PrismaIdeaRepository } from './idea.prisma';
import { PrismaProcessingRepository } from './processing.prisma';

type LatestIdeaResponse = {
  id: string;
  name: string;
  ideaTypeId: string;
  ideaTypeName: string;
  updatedAt: string;
};

type DashboardSummaryResponse = {
  stats: DashboardStats;
  latestIdeas: LatestIdeaResponse[];
  activity: DashboardActivityPoint[];
};

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly ideaRepository: PrismaIdeaRepository,
    private readonly ideaTypeRepository: PrismaIdeaTypeRepository,
    private readonly processingRepository: PrismaProcessingRepository,
  ) {}

  @Get('/summary')
  async summary(
    @CurrentUser('id') userId: string,
    @Query('latestLimit') latestLimit?: string,
  ): Promise<DashboardSummaryResponse> {
    const useCase = new LoadDashboardSummary(
      this.ideaRepository,
      this.ideaTypeRepository,
      this.processingRepository,
    );

    const result = await useCase.execute({
      userId,
      latestLimit: this.toLimit(latestLimit),
    });

    return {
      stats: result.stats,
      latestIdeas: result.latestIdeas.map((idea) => ({
        ...idea,
        updatedAt: idea.updatedAt.toISOString(),
      })),
      activity: result.activity,
    };
  }

  // Só converte o texto em número; a validação do valor é do caso de uso.
  private toLimit(value: string | undefined): number | undefined {
    return value === undefined ? undefined : Number(value);
  }
}
