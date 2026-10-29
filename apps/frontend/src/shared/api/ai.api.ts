import type { ApiErrorResponse } from '@/shared/types/api-error.type';

export type GenerateAiTextInput = {
  prompt: string;
  context?: string;
  instruction?: string;
};

export class AiApiError extends Error {
  constructor(
    readonly status: number,
    readonly codes: string[],
  ) {
    super(codes.join(', '));
  }
}

async function readApiError(response: Response): Promise<AiApiError> {
  const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;
  return new AiApiError(response.status, body?.errors?.length ? body.errors : ['DEFAULT_API_ERROR']);
}

const EXTENSION_BY_SUBTYPE: Record<string, string> = { mpeg: 'mp3', 'x-m4a': 'm4a' };

function audioFileNameFor(blob: Blob): string {
  const subtype = blob.type.split(';')[0].split('/')[1]?.trim().toLowerCase();

  return `audio.${(subtype && (EXTENSION_BY_SUBTYPE[subtype] ?? subtype)) || 'webm'}`;
}

export async function transcribeAiAudio(token: string | null, audioBlob: Blob, fileName?: string): Promise<string> {
  const form = new FormData();
  form.append('audio', audioBlob, fileName ?? audioFileNameFor(audioBlob));

  // Sem Content-Type: o navegador define o multipart com o boundary.
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/transcribe`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });

  if (!response.ok) throw await readApiError(response);

  const body = (await response.json()) as { text: string };
  return body.text;
}

export async function generateAiText(token: string | null, input: GenerateAiTextInput): Promise<string> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    throw new AiApiError(response.status, body?.errors?.length ? body.errors : ['DEFAULT_API_ERROR']);
  }

  const body = (await response.json()) as { text: string };
  return body.text;
}
