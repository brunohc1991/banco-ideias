import { DomainError } from '@ideias/shared';
import { OpenAiProvider, audioFileName } from './openai.provider';

function makeProvider(create: jest.Mock, model = 'whisper-1') {
  const client = { audio: { transcriptions: { create } } } as never;

  return new OpenAiProvider(client, model);
}

const INPUT = { audio: Buffer.from('audio'), mimeType: 'audio/webm;codecs=opus' };

describe('OpenAiProvider', () => {
  it('devolve o texto aparado e envia o arquivo com o modelo configurado', async () => {
    const create = jest.fn().mockResolvedValue({ text: '  ola mundo ' });

    await expect(makeProvider(create, 'gpt-4o-transcribe').transcribe(INPUT)).resolves.toBe('ola mundo');

    const args = create.mock.calls[0][0];
    expect(args.model).toBe('gpt-4o-transcribe');
    expect(args.file.name).toBe('audio.webm');
  });

  it('responde ai.transcribe.empty quando nao ha fala', async () => {
    const create = jest.fn().mockResolvedValue({ text: '   ' });

    await expect(makeProvider(create).transcribe(INPUT)).rejects.toMatchObject({
      statusCode: 502,
      message: 'ai.transcribe.empty',
    });
  });

  it('trata texto ausente como vazio', async () => {
    const create = jest.fn().mockResolvedValue({});

    await expect(makeProvider(create).transcribe(INPUT)).rejects.toMatchObject({
      message: 'ai.transcribe.empty',
    });
  });

  it('esconde a mensagem do provedor em ai.transcribe.failed', async () => {
    const create = jest.fn().mockRejectedValue(new Error('quota estourada'));
    const promise = makeProvider(create).transcribe(INPUT);

    await expect(promise).rejects.toBeInstanceOf(DomainError);
    await expect(promise).rejects.toMatchObject({ statusCode: 502, message: 'ai.transcribe.failed' });
  });

  it('trata falha sem mensagem', async () => {
    const create = jest.fn().mockRejectedValue(undefined);

    await expect(makeProvider(create).transcribe(INPUT)).rejects.toMatchObject({
      message: 'ai.transcribe.failed',
    });
  });

  it.each([
    ['audio/webm;codecs=opus', 'audio.webm'],
    ['audio/mp4', 'audio.mp4'],
    ['audio/mpeg', 'audio.mp3'],
    ['audio/x-m4a', 'audio.m4a'],
    ['audio/ogg', 'audio.ogg'],
    ['audio/desconhecido', 'audio.webm'],
    ['audio', 'audio.webm'],
  ])('deriva o nome de %s', (mimeType, expected) => {
    expect(audioFileName(mimeType)).toBe(expected);
  });
});
