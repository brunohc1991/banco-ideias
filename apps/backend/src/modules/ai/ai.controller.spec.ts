import { AiController } from './ai.controller';
import { AiProvider, AiTranscriptionProvider } from './ai.provider';

class FakeAiProvider extends AiProvider {
  readonly calls: { systemPrompt: string; userMessage: string }[] = [];

  async generate(input: { systemPrompt: string; userMessage: string }): Promise<string> {
    this.calls.push(input);
    return 'gerado';
  }
}

class FakeTranscriptionProvider extends AiTranscriptionProvider {
  readonly calls: { audio: Buffer; mimeType: string }[] = [];

  async transcribe(input: { audio: Buffer; mimeType: string }): Promise<string> {
    this.calls.push(input);
    return 'transcrito';
  }
}

function setup() {
  const provider = new FakeAiProvider();
  const transcription = new FakeTranscriptionProvider();

  return { provider, transcription, controller: new AiController(provider, transcription) };
}

describe('AiController', () => {
  it('gera apenas com prompt usando o pedido padrao', async () => {
    const { provider, controller } = setup();

    await expect(controller.generate({ prompt: 'orientacao' })).resolves.toEqual({ text: 'gerado' });
    expect(provider.calls).toEqual([
      { systemPrompt: 'orientacao', userMessage: 'Gere o conteúdo solicitado.' },
    ]);
  });

  it('compoe contexto e instrucao na mensagem do usuario', async () => {
    const { provider, controller } = setup();

    await controller.generate({ prompt: 'p', context: 'Nome: X', instruction: 'seja breve' });

    expect(provider.calls[0].userMessage).toBe(
      'Contexto:\nNome: X\n\nInstrução adicional do usuário: seja breve',
    );
  });

  it('compoe so o contexto ou so a instrucao', async () => {
    const { provider, controller } = setup();

    await controller.generate({ prompt: 'p', context: 'c' });
    await controller.generate({ prompt: 'p', instruction: 'i' });

    expect(provider.calls.map((call) => call.userMessage)).toEqual([
      'Contexto:\nc',
      'Instrução adicional do usuário: i',
    ]);
  });

  it.each([[undefined], [''], [123], ['a'.repeat(8001)]])(
    'rejeita prompt invalido (%p) com ai.prompt.invalid 422',
    async (prompt) => {
      const { provider, controller } = setup();

      await expect(controller.generate({ prompt })).rejects.toMatchObject({
        statusCode: 422,
        message: 'ai.prompt.invalid',
      });
      expect(provider.calls).toEqual([]);
    },
  );

  it('rejeita corpo ausente', async () => {
    await expect(setup().controller.generate()).rejects.toMatchObject({ message: 'ai.prompt.invalid' });
  });

  it('aceita os limites exatos', async () => {
    const { controller } = setup();

    await expect(
      controller.generate({
        prompt: 'a'.repeat(8000),
        context: 'a'.repeat(16000),
        instruction: 'a'.repeat(2000),
      }),
    ).resolves.toEqual({ text: 'gerado' });
  });

  it.each([
    [{ context: 'a'.repeat(16001) }],
    [{ instruction: 'a'.repeat(2001) }],
  ])('rejeita entrada longa demais %#', async (extra) => {
    const { provider, controller } = setup();

    await expect(controller.generate({ prompt: 'p', ...extra })).rejects.toMatchObject({
      statusCode: 422,
      message: 'ai.input.too_long',
    });
    expect(provider.calls).toEqual([]);
  });

  describe('transcribe', () => {
    const audio = (overrides: object = {}) => ({
      buffer: Buffer.from('audio'),
      mimetype: 'audio/webm',
      size: 5,
      ...overrides,
    });

    it('transcreve um audio valido', async () => {
      const { transcription, controller } = setup();

      await expect(controller.transcribe(audio())).resolves.toEqual({ text: 'transcrito' });
      expect(transcription.calls).toEqual([{ audio: Buffer.from('audio'), mimeType: 'audio/webm' }]);
    });

    it.each([undefined, audio({ buffer: Buffer.alloc(0), size: 0 })])(
      'exige o arquivo (%#)',
      async (file) => {
        const { transcription, controller } = setup();

        await expect(controller.transcribe(file)).rejects.toMatchObject({
          statusCode: 422,
          message: 'ai.audio.required',
        });
        expect(transcription.calls).toEqual([]);
      },
    );

    it('rejeita arquivo que nao e audio', async () => {
      const { transcription, controller } = setup();

      await expect(controller.transcribe(audio({ mimetype: 'text/plain' }))).rejects.toMatchObject({
        statusCode: 422,
        message: 'ai.audio.invalid_type',
      });
      expect(transcription.calls).toEqual([]);
    });

    it('rejeita audio acima de 25 MB sem chamar o provedor', async () => {
      const { transcription, controller } = setup();

      await expect(
        controller.transcribe(audio({ size: 25 * 1024 * 1024 + 1 })),
      ).rejects.toMatchObject({ statusCode: 422, message: 'ai.audio.too_large' });
      expect(transcription.calls).toEqual([]);
    });
  });
});
