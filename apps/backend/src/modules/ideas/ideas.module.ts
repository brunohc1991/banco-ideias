import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { DbModule } from '../../db/db.module';
import { DashboardController } from './dashboard.controller';
import { IdeaTypeController } from './idea-type.controller';
import { PrismaIdeaTypeRepository } from './idea-type.prisma';
import { IdeaController } from './idea.controller';
import { PrismaIdeaRepository } from './idea.prisma';
import { PROCESSING_AI_PROVIDER } from './ideas.tokens';
import { ModuleAiProviderAdapter } from './module-ai-provider.adapter';
import { ProcessingController } from './processing.controller';
import { PrismaProcessingRepository } from './processing.prisma';

@Module({
  imports: [DbModule, AiModule],
  controllers: [IdeaController, IdeaTypeController, ProcessingController, DashboardController],
  providers: [
    PrismaIdeaTypeRepository,
    PrismaIdeaRepository,
    PrismaProcessingRepository,
    { provide: PROCESSING_AI_PROVIDER, useClass: ModuleAiProviderAdapter },
  ],
  exports: [PrismaIdeaTypeRepository, PrismaIdeaRepository, PrismaProcessingRepository],
})
export class IdeasModule {}
