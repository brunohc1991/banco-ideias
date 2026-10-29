import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  DeleteIdeaType,
  LoadDefaultIdeaTypes,
  SaveIdeaType,
  type IdeaType,
  type LoadDefaultIdeaTypesOut,
  type SaveIdeaTypeIn,
} from '@ideias/ideas';
import { NotFoundError, type PageResult } from '@ideias/shared';
import { CurrentUser } from '../../shared/decorators';
import { PrismaIdeaTypeRepository } from './idea-type.prisma';

type IdeaTypeBody = Pick<SaveIdeaTypeIn, 'name' | 'description' | 'prompt'>;

type IdeaTypeResponse = {
  id: string;
  name: string;
  description: string;
  prompt: string;
  updatedAt: Date;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 10;

@Controller('idea-types')
export class IdeaTypeController {
  constructor(private readonly ideaTypeRepository: PrismaIdeaTypeRepository) {}

  @Post('/')
  async create(
    @Body() body: IdeaTypeBody,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    const useCase = new SaveIdeaType(this.ideaTypeRepository);

    await useCase.execute({ ...this.pickFields(body), userId });
  }

  @Post('/load-defaults')
  @HttpCode(200)
  async loadDefaults(
    @CurrentUser('id') userId: string,
  ): Promise<LoadDefaultIdeaTypesOut> {
    const useCase = new LoadDefaultIdeaTypes(this.ideaTypeRepository);

    return useCase.execute({ userId });
  }

  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() body: IdeaTypeBody,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    const useCase = new SaveIdeaType(this.ideaTypeRepository);

    await useCase.execute({ ...this.pickFields(body), id, userId });
  }

  @Delete('/:id')
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    const useCase = new DeleteIdeaType(this.ideaTypeRepository);

    await useCase.execute({ id, userId });
  }

  @Get('/:id')
  async findById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<IdeaTypeResponse> {
    const ideaType = await this.ideaTypeRepository.findById(id);

    // Registro de outro usuário responde 404 para não revelar sua existência.
    if (!ideaType || ideaType.userId !== userId) {
      throw new NotFoundError('idea-type.not_found');
    }

    return this.toResponse(ideaType);
  }

  @Get('/')
  async findPage(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ): Promise<PageResult<IdeaTypeResponse>> {
    const result = await this.ideaTypeRepository.findPage({
      userId,
      page: this.toPositiveInt(page, DEFAULT_PAGE),
      perPage: this.toPositiveInt(perPage, DEFAULT_PER_PAGE),
    });

    return { ...result, items: result.items.map((item) => this.toResponse(item)) };
  }

  private pickFields(body?: IdeaTypeBody): IdeaTypeBody {
    return {
      name: body?.name as string,
      description: body?.description as string,
      prompt: body?.prompt as string,
    };
  }

  private toPositiveInt(value: string | undefined, fallback: number): number {
    const parsed = Number.parseInt(value ?? '', 10);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private toResponse(ideaType: IdeaType): IdeaTypeResponse {
    return {
      id: ideaType.id,
      name: ideaType.name,
      description: ideaType.description,
      prompt: ideaType.prompt,
      updatedAt: ideaType.updatedAt,
    };
  }
}
