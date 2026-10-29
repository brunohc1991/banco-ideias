import Anthropic from '@anthropic-ai/sdk';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { DomainError } from '@ideias/shared';
import { AiGenerateInput, AiProvider } from './ai.provider';
import { ANTHROPIC_CLIENT, ANTHROPIC_MODEL } from './ai.tokens';

// A API da Anthropic exige `max_tokens`; o valor cobre o maior texto gerado pelos formulários.
const MAX_TOKENS = 4096;

@Injectable()
export class AnthropicProvider extends AiProvider {
  private readonly logger = new Logger(AnthropicProvider.name);

  constructor(
    @Inject(ANTHROPIC_CLIENT) private readonly client: Pick<Anthropic, 'messages'>,
    @Inject(ANTHROPIC_MODEL) private readonly model: string,
  ) {
    super();
  }

  async generate({ systemPrompt, userMessage }: AiGenerateInput): Promise<string> {
    let text: string;

    try {
      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      });

      text = (message.content ?? [])
        .map((block) => (block.type === 'text' ? block.text : ''))
        .join('');
    } catch (error) {
      this.logger.error(`Anthropic request failed: ${(error as Error)?.message}`);
      throw new DomainError('ai.generate.failed', 502);
    }

    if (!text.trim()) {
      throw new DomainError('ai.generate.empty', 502);
    }

    return text;
  }
}
