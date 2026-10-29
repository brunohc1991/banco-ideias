export interface AiGenerateInput {
  systemPrompt: string;
  userMessage: string;
}

// Porta de IA do módulo: o domínio depende desta abstração, nunca de um provedor.
export interface AiProvider {
  generate(input: AiGenerateInput): Promise<string>;
}
