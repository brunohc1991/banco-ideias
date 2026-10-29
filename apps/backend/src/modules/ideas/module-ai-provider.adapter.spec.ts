import { AiProvider } from '../ai/ai.provider';
import { ModuleAiProviderAdapter } from './module-ai-provider.adapter';

class FakeAiProvider extends AiProvider {
  readonly calls: { systemPrompt: string; userMessage: string }[] = [];

  async generate(input: { systemPrompt: string; userMessage: string }): Promise<string> {
    this.calls.push(input);
    return 'gerado';
  }
}

describe('ModuleAiProviderAdapter', () => {
  it('delega a geracao ao provedor do modulo ai', async () => {
    const provider = new FakeAiProvider();
    const adapter = new ModuleAiProviderAdapter(provider);
    const input = { systemPrompt: 'sistema', userMessage: 'usuario' };

    await expect(adapter.generate(input)).resolves.toBe('gerado');
    expect(provider.calls).toEqual([input]);
  });

  it('propaga a falha do provedor', async () => {
    const provider = new FakeAiProvider();
    provider.generate = () => Promise.reject(new Error('falhou'));

    await expect(
      new ModuleAiProviderAdapter(provider).generate({ systemPrompt: 'a', userMessage: 'b' }),
    ).rejects.toThrow('falhou');
  });
});
