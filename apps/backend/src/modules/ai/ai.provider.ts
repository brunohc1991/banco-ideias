export interface AiGenerateInput {
  systemPrompt: string;
  userMessage: string;
}

export abstract class AiProvider {
  abstract generate(input: AiGenerateInput): Promise<string>;
}

export interface AiTranscribeInput {
  audio: Buffer;
  mimeType: string;
}

export abstract class AiTranscriptionProvider {
  abstract transcribe(input: AiTranscribeInput): Promise<string>;
}
