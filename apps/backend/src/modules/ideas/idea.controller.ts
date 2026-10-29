import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  DeleteIdea,
  SaveIdea,
  type Idea,
  type SaveIdeaIn,
  type SaveIdeaResourceIn,
} from '@ideias/ideas';
import { NotFoundError, type PageResult } from '@ideias/shared';
import { CurrentUser } from '../../shared/decorators';
import { PrismaIdeaTypeRepository } from './idea-type.prisma';
import { PrismaIdeaRepository } from './idea.prisma';
import { PrismaProcessingRepository } from './processing.prisma';

type IdeaBody = Pick<
  SaveIdeaIn,
  'name' | 'description' | 'objective' | 'ideaTypeId' | 'resources'
>;

type ResourceResponse = {
  id: string;
  type: string;
  content: string;
  position: number;
};

type IdeaResponse = {
  id: string;
  name: string;
  description: string;
  objective: string;
  ideaTypeId: string;
  updatedAt: Date;
};

type IdeaDetailResponse = IdeaResponse & { resources: ResourceResponse[] };

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 10;

@Controller('ideas')
export class IdeaController {
  constructor(
    private readonly ideaRepository: PrismaIdeaRepository,
    private readonly ideaTypeRepository: PrismaIdeaTypeRepository,
    private readonly processingRepository: PrismaProcessingRepository,
  ) {}

  @Post('/')
  async create(
    @Body() body: IdeaBody,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    const useCase = new SaveIdea(this.ideaRepository, this.ideaTypeRepository);

    await useCase.execute({ ...this.pickFields(body), userId });
  }

  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() body: IdeaBody,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    const useCase = new SaveIdea(this.ideaRepository, this.ideaTypeRepository);

    await useCase.execute({ ...this.pickFields(body), id, userId });
  }

  @Delete('/:id')
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    const useCase = new DeleteIdea(this.ideaRepository, this.processingRepository);

    await useCase.execute({ id, userId });
  }

  @Get('/:id')
  async findById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<IdeaDetailResponse> {
    const idea = await this.ideaRepository.findById(id);

    // Registro de outro usuário responde 404 para não revelar sua existência.
    if (!idea || idea.userId !== userId) {
      throw new NotFoundError('idea.not_found');
    }

    return {
      ...this.toResponse(idea),
      resources: idea.resources.map((item) => ({
        id: item.id,
        type: item.type,
        content: item.content,
        position: item.position,
      })),
    };
  }

  @Get('/')
  async findPage(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ): Promise<PageResult<IdeaResponse>> {
    const result = await this.ideaRepository.findPage({
      userId,
      page: this.toPositiveInt(page, DEFAULT_PAGE),
      perPage: this.toPositiveInt(perPage, DEFAULT_PER_PAGE),
    });

    return { ...result, items: result.items.map((item) => this.toResponse(item)) };
  }

  private pickFields(body?: IdeaBody): IdeaBody {
    return {
      name: body?.name as string,
      description: body?.description as string,
      objective: body?.objective as string,
      ideaTypeId: body?.ideaTypeId as string,
      resources: this.pickResources(body?.resources),
    };
  }

  private pickResources(value: unknown): SaveIdeaResourceIn[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((item: Partial<SaveIdeaResourceIn> | null) => ({
      id: item?.id,
      type: item?.type,
      content: item?.content as string,
      position: item?.position as number,
    }));
  }

  private toPositiveInt(value: string | undefined, fallback: number): number {
    const parsed = Number.parseInt(value ?? '', 10);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private toResponse(idea: Idea): IdeaResponse {
    return {
      id: idea.id,
      name: idea.name,
      description: idea.description,
      objective: idea.objective,
      ideaTypeId: idea.ideaTypeId,
      updatedAt: idea.updatedAt,
    };
  }
}
