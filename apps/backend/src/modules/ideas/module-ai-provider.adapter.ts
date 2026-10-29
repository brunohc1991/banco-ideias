import { Injectable } from '@nestjs/common';
import { AiGenerateInput, AiProvider as ModuleAiProvider } from '@ideias/ideas';
import { AiProvider } from '../ai/ai.provider';

// Liga a porta de IA do módulo `ideas` ao provedor de infraestrutura do módulo `ai`.
@Injectable()
export class ModuleAiProviderAdapter implements ModuleAiProvider {
  constructor(private readonly aiProvider: AiProvider) {}

  generate(input: AiGenerateInput): Promise<string> {
    return this.aiProvider.generate(input);
  }
}
