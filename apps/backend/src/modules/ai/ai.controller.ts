import {
  Body,
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DomainError } from '@ideias/shared';
import { AiProvider, AiTranscriptionProvider } from './ai.provider';
import { AudioUploadErrorInterceptor } from './audio-upload-error.interceptor';

export type UploadedAudio = { buffer: Buffer; mimetype: string; size: number };

type GenerateBody = {
  prompt?: unknown;
  context?: unknown;
  instruction?: unknown;
};

const MAX_PROMPT = 8000;
const MAX_CONTEXT = 16000;
const MAX_INSTRUCTION = 2000;
export const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const DEFAULT_USER_MESSAGE = 'Gere o conteúdo solicitado.';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiProvider: AiProvider,
    private readonly transcriptionProvider: AiTranscriptionProvider,
  ) {}

  @Post('/transcribe')
  @HttpCode(200)
  @UseInterceptors(
    AudioUploadErrorInterceptor,
    FileInterceptor('audio', { limits: { fileSize: MAX_AUDIO_BYTES } }),
  )
  async transcribe(@UploadedFile() file?: UploadedAudio): Promise<{ text: string }> {
    if (!file?.buffer?.length) {
      throw new DomainError('ai.audio.required', 422);
    }

    if (!file.mimetype?.startsWith('audio/')) {
      throw new DomainError('ai.audio.invalid_type', 422);
    }

    if (file.size > MAX_AUDIO_BYTES) {
      throw new DomainError('ai.audio.too_large', 422);
    }

    const text = await this.transcriptionProvider.transcribe({
      audio: file.buffer,
      mimeType: file.mimetype,
    });

    return { text };
  }

  @Post('/generate')
  @HttpCode(200)
  async generate(@Body() body?: GenerateBody): Promise<{ text: string }> {
    const prompt = body?.prompt;
    const context = this.optionalText(body?.context);
    const instruction = this.optionalText(body?.instruction);

    if (typeof prompt !== 'string' || prompt.length < 1 || prompt.length > MAX_PROMPT) {
      throw new DomainError('ai.prompt.invalid', 422);
    }

    if ((context?.length ?? 0) > MAX_CONTEXT || (instruction?.length ?? 0) > MAX_INSTRUCTION) {
      throw new DomainError('ai.input.too_long', 422);
    }

    const text = await this.aiProvider.generate({
      systemPrompt: prompt,
      userMessage: this.composeUserMessage(context, instruction),
    });

    return { text };
  }

  private optionalText(value: unknown): string | undefined {
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  }

  private composeUserMessage(context?: string, instruction?: string): string {
    const parts: string[] = [];

    if (context) parts.push(`Contexto:\n${context}`);
    if (instruction) parts.push(`Instrução adicional do usuário: ${instruction}`);

    return parts.length ? parts.join('\n\n') : DEFAULT_USER_MESSAGE;
  }
}
