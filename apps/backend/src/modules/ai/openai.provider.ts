import OpenAI, { toFile } from 'openai';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { DomainError } from '@ideias/shared';
import { AiTranscribeInput, AiTranscriptionProvider } from './ai.provider';
import { OPENAI_CLIENT, OPENAI_TRANSCRIPTION_MODEL } from './ai.tokens';

const FALLBACK_EXTENSION = 'webm';
const EXTENSION_BY_SUBTYPE: Record<string, string> = {
  mpeg: 'mp3',
  mpga: 'mp3',
  'x-m4a': 'm4a',
  mp4: 'mp4',
  wav: 'wav',
  'x-wav': 'wav',
  ogg: 'ogg',
  webm: 'webm',
  flac: 'flac',
};

// A OpenAI infere o formato pelo nome do arquivo, então a extensão precisa casar com o tipo.
export function audioFileName(mimeType: string): string {
  const subtype = mimeType.split(';')[0].split('/')[1]?.trim().toLowerCase();

  return `audio.${(subtype && EXTENSION_BY_SUBTYPE[subtype]) || FALLBACK_EXTENSION}`;
}

@Injectable()
export class OpenAiProvider extends AiTranscriptionProvider {
  private readonly logger = new Logger(OpenAiProvider.name);

  constructor(
    @Inject(OPENAI_CLIENT) private readonly client: Pick<OpenAI, 'audio'>,
    @Inject(OPENAI_TRANSCRIPTION_MODEL) private readonly model: string,
  ) {
    super();
  }

  async transcribe({ audio, mimeType }: AiTranscribeInput): Promise<string> {
    let text: string;

    try {
      const file = await toFile(audio, audioFileName(mimeType), { type: mimeType });
      const result = await this.client.audio.transcriptions.create({
        file,
        model: this.model,
      });

      text = result.text ?? '';
    } catch (error) {
      this.logger.error(`OpenAI transcription failed: ${(error as Error)?.message}`);
      throw new DomainError('ai.transcribe.failed', 502);
    }

    if (!text.trim()) {
      throw new DomainError('ai.transcribe.empty', 502);
    }

    return text.trim();
  }
}
