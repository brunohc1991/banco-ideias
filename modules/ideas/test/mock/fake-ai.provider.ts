import { AiGenerateInput, AiProvider } from "../../src";

export class FakeAiProvider implements AiProvider {
  readonly calls: AiGenerateInput[] = [];
  failWith: Error | null = null;

  constructor(private readonly answers: string[] = ["# Resultado"]) {}

  async generate(input: AiGenerateInput): Promise<string> {
    this.calls.push(input);

    if (this.failWith) {
      throw this.failWith;
    }

    return this.answers[Math.min(this.calls.length - 1, this.answers.length - 1)];
  }
}
