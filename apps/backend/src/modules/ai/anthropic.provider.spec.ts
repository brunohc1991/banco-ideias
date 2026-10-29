import { DomainError } from '@ideias/shared';
import { AnthropicProvider } from './anthropic.provider';

function makeProvider(create: jest.Mock, model = 'claude-haiku-5-5') {
  const client = { messages: { create } } as never;

  return new AnthropicProvider(client, model);
}

const INPUT = { systemPrompt: 'sistema', userMessage: 'usuario' };

describe('AnthropicProvider', () => {
  it('devolve o texto e envia sistema e usuario com o modelo configurado', async () => {
    const create = jest.fn().mockResolvedValue({ content: [{ type: 'text', text: 'texto' }] });

    await expect(makeProvider(create).generate(INPUT)).resolves.toBe('texto');

    expect(create).toHaveBeenCalledWith({
      model: 'claude-haiku-5-5',
      max_tokens: 4096,
      system: 'sistema',
      messages: [{ role: 'user', content: 'usuario' }],
    });
  });

  it('usa o modelo informado', async () => {
    const create = jest.fn().mockResolvedValue({ content: [{ type: 'text', text: 'x' }] });

    await makeProvider(create, 'claude-sonnet-5-5').generate(INPUT);

    expect(create).toHaveBeenCalledWith(expect.objectContaining({ model: 'claude-sonnet-5-5' }));
  });

  it('junta os blocos de texto e ignora os demais', async () => {
    const create = jest.fn().mockResolvedValue({
      content: [
        { type: 'text', text: 'ola ' },
        { type: 'tool_use' },
        { type: 'text', text: 'mundo' },
      ],
    });

    await expect(makeProvider(create).generate(INPUT)).resolves.toBe('ola mundo');
  });

  it('converte erro do SDK em ai.generate.failed 502 sem vazar a mensagem', async () => {
    const create = jest.fn().mockRejectedValue(new Error('quota secreta'));
    const promise = makeProvider(create).generate(INPUT);

    await expect(promise).rejects.toBeInstanceOf(DomainError);
    await expect(promise).rejects.toMatchObject({ statusCode: 502, message: 'ai.generate.failed' });
  });

  it.each([[[]], [[{ type: 'text', text: '   ' }]], [[{ type: 'tool_use' }]], [undefined]])(
    'converte resposta vazia (%j) em ai.generate.empty',
    async (content) => {
      const create = jest.fn().mockResolvedValue({ content });

      await expect(makeProvider(create).generate(INPUT)).rejects.toMatchObject({
        statusCode: 502,
        message: 'ai.generate.empty',
      });
    },
  );
});
