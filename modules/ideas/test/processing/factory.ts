import { ValidationException } from "@ideias/shared";
import { Processing, ProcessingIteration, ProcessingState } from "../../src";

export const OWNER_ID = "7c9e6679-7425-4f40-944b-e07fc1f90ae7";
export const OTHER_ID = "0b8f7a1e-3c52-4d6a-9f21-5a1e8c7d4b90";
export const TYPE_ID = "c3d2b1a0-9f8e-4d7c-8b6a-5f4e3d2c1b0a";
export const IDEA_ID = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";

export function makeIteration(position = 0, refinement: string | null = null) {
  return new ProcessingIteration({ refinement, result: `resultado ${position}`, position });
}

export function makeProcessingState(overrides: Partial<ProcessingState> = {}): ProcessingState {
  return {
    userId: OWNER_ID,
    ideaId: IDEA_ID,
    ideaName: "App de receitas",
    ideaDescription: "Aplicativo que sugere receitas.",
    ideaObjective: "Reduzir o desperdicio de comida.",
    ideaTypeId: TYPE_ID,
    ideaTypeName: "Roteiro viral",
    promptTemplate: "Crie sobre {{name}}: {{description}}. Objetivo: {{objective}}.\n{{resources}}",
    resources: [],
    iterations: [makeIteration()],
    ...overrides,
  };
}

export function makeProcessing(overrides: Partial<ProcessingState> = {}): Processing {
  return new Processing(makeProcessingState(overrides));
}

export function getMessages(callback: () => void): string[] {
  try {
    callback();
    return [];
  } catch (error) {
    return (error as ValidationException).errors.map((item) => item.message);
  }
}

export async function getAsyncMessages(promise: Promise<unknown>): Promise<string[]> {
  try {
    await promise;
    return [];
  } catch (error) {
    return (error as ValidationException).errors.map((item) => item.message);
  }
}
