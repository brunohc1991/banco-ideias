import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  DeleteProcessing,
  RefineProcessing,
  StartProcessing,
  type AiProvider,
  type IdeaSearchItem,
  type Processing,
  type ProcessingIteration,
  type ProcessingSummary,
} from '@ideias/ideas';
import { NotFoundError, type PageResult } from '@ideias/shared';
import { CurrentUser } from '../../shared/decorators';
import { PROCESSING_AI_PROVIDER } from './ideas.tokens';
import { PrismaIdeaTypeRepository } from './idea-type.prisma';
import { PrismaIdeaRepository } from './idea.prisma';
import { PrismaProcessingRepository } from './processing.prisma';

type IterationResponse = {
  id: string;
  refinement: string | null;
  result: string;
  position: number;
  createdAt: Date;
};

type ProcessingResponse = {
  id: string;
  ideaId: string;
  ideaName: string;
  ideaDescription: string;
  ideaObjective: string;
  ideaTypeId: string;
  ideaTypeName: string;
  resources: { type: string; content: string; position: number }[];
  iterations: IterationResponse[];
  createdAt: Date;
  updatedAt: Date;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 10;

@Controller('processings')
export class ProcessingController {
  constructor(
    private readonly processingRepository: PrismaProcessingRepository,
    private readonly ideaRepository: PrismaIdeaRepository,
    private readonly ideaTypeRepository: PrismaIdeaTypeRepository,
    @Inject(PROCESSING_AI_PROVIDER) private readonly aiProvider: AiProvider,
  ) {}

  @Post('/')
  async create(
    @Body() body: { ideaId?: unknown } | undefined,
    @CurrentUser('id') userId: string,
  ): Promise<ProcessingResponse> {
    const useCase = new StartProcessing(
      this.ideaRepository,
      this.ideaTypeRepository,
      this.processingRepository,
      this.aiProvider,
    );

    const ideaId = typeof body?.ideaId === 'string' ? body.ideaId : '';

    return this.toResponse(await useCase.execute({ ideaId, userId }));
  }

  // Rota fixa declarada antes de `/:id` para não ser capturada como id.
  @Get('/idea-search')
  async searchIdeas(
    @CurrentUser('id') userId: string,
    @Query('term') term?: string,
  ): Promise<IdeaSearchItem[]> {
    return this.processingRepository.searchIdeas({ userId, term: term ?? '' });
  }

  @Post('/:id/iterations')
  async refine(
    @Param('id') id: string,
    @Body() body: { refinement?: unknown } | undefined,
    @CurrentUser('id') userId: string,
  ): Promise<IterationResponse> {
    const useCase = new RefineProcessing(this.processingRepository, this.aiProvider);

    const refinement = typeof body?.refinement === 'string' ? body.refinement : '';

    return this.toIterationResponse(await useCase.execute({ id, userId, refinement }));
  }

  @Delete('/:id')
  @HttpCode(204)
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await new DeleteProcessing(this.processingRepository).execute({ id, userId });
  }

  @Get('/:id')
  async findById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<ProcessingResponse> {
    const processing = await this.processingRepository.findById(id);

    // Registro de outro usuário responde 404 para não revelar sua existência.
    if (!processing || processing.userId !== userId) {
      throw new NotFoundError('processing.not_found');
    }

    return this.toResponse(processing);
  }

  @Get('/')
  async findPage(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ): Promise<PageResult<ProcessingSummary>> {
    return this.processingRepository.findPage({
      userId,
      page: this.toPositiveInt(page, DEFAULT_PAGE),
      perPage: this.toPositiveInt(perPage, DEFAULT_PER_PAGE),
    });
  }

  private toPositiveInt(value: string | undefined, fallback: number): number {
    const parsed = Number.parseInt(value ?? '', 10);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private toIterationResponse(iteration: ProcessingIteration): IterationResponse {
    return {
      id: iteration.id,
      refinement: iteration.refinement,
      result: iteration.result,
      position: iteration.position,
      createdAt: iteration.createdAt,
    };
  }

  private toResponse(processing: Processing): ProcessingResponse {
    return {
      id: processing.id,
      ideaId: processing.ideaId,
      ideaName: processing.ideaName,
      ideaDescription: processing.ideaDescription,
      ideaObjective: processing.ideaObjective,
      ideaTypeId: processing.ideaTypeId,
      ideaTypeName: processing.ideaTypeName,
      resources: processing.resources.map((item) => ({
        type: item.type,
        content: item.content,
        position: item.position,
      })),
      iterations: processing.iterations.map((item) => this.toIterationResponse(item)),
      createdAt: processing.createdAt,
      updatedAt: processing.updatedAt,
    };
  }
}
