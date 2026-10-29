import Anthropic from '@anthropic-ai/sdk';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiController } from './ai.controller';
import OpenAI from 'openai';
import { AiProvider, AiTranscriptionProvider } from './ai.provider';
import {
  ANTHROPIC_CLIENT,
  ANTHROPIC_MODEL,
  OPENAI_CLIENT,
  OPENAI_TRANSCRIPTION_MODEL,
} from './ai.tokens';
import { AnthropicProvider } from './anthropic.provider';
import { OpenAiProvider } from './openai.provider';

const DEFAULT_MODEL = 'claude-haiku-5-5';
// O SDK lança no construtor sem chave; um valor de reserva deixa o backend subir
// e a chamada falha depois como `ai.generate.failed`.
const MISSING_KEY_PLACEHOLDER = 'missing-anthropic-api-key';
const DEFAULT_TRANSCRIPTION_MODEL = 'whisper-1';
const MISSING_OPENAI_KEY_PLACEHOLDER = 'missing-openai-api-key';

@Module({
  controllers: [AiController],
  providers: [
    {
      provide: ANTHROPIC_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Anthropic({ apiKey: config.get<string>('ANTHROPIC_API_KEY') || MISSING_KEY_PLACEHOLDER }),
    },
    {
      provide: ANTHROPIC_MODEL,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get<string>('ANTHROPIC_MODEL') || DEFAULT_MODEL,
    },
    { provide: AiProvider, useClass: AnthropicProvider },
    // A Anthropic não transcreve áudio; a transcrição usa a OpenAI com chave própria.
    {
      provide: OPENAI_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new OpenAI({ apiKey: config.get<string>('OPENAI_API_KEY') || MISSING_OPENAI_KEY_PLACEHOLDER }),
    },
    {
      provide: OPENAI_TRANSCRIPTION_MODEL,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        config.get<string>('OPENAI_TRANSCRIPTION_MODEL') || DEFAULT_TRANSCRIPTION_MODEL,
    },
    { provide: AiTranscriptionProvider, useClass: OpenAiProvider },
  ],
  exports: [AiProvider],
})
export class AiModule {}
