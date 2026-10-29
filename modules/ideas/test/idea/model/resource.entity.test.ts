import { ValidationException } from "@ideias/shared";
import { RESOURCE_TYPES, Resource, ResourceState } from "../../../src";

function makeState(overrides: Partial<ResourceState> = {}): ResourceState {
  return {
    type: "text",
    content: "Referencia sobre receitas.",
    position: 0,
    ...overrides,
  };
}

function getValidationMessages(callback: () => void): string[] {
  try {
    callback();
    return [];
  } catch (error) {
    return (error as ValidationException).errors.map((item) => item.message);
  }
}

describe("Resource", () => {
  it("cria uma entidade valida e expoe os getters", () => {
    const resource = new Resource(makeState({ position: 2 }));

    expect(resource.type).toBe("text");
    expect(resource.content).toBe("Referencia sobre receitas.");
    expect(resource.position).toBe(2);
    expect(resource.id).toBeDefined();
    expect(() => resource.validate()).not.toThrow();
  });

  it("exporta a lista de tipos suportados", () => {
    expect(RESOURCE_TYPES).toEqual(["text"]);
  });

  it("rejeita tipo ausente", () => {
    const messages = getValidationMessages(() =>
      new Resource(makeState({ type: "" as never })).validate(),
    );

    expect(messages).toEqual(["idea.resource.type.required"]);
  });

  it("rejeita tipo invalido", () => {
    const messages = getValidationMessages(() =>
      new Resource(makeState({ type: "image" as never })).validate(),
    );

    expect(messages).toEqual(["idea.resource.type.in"]);
  });

  it("rejeita conteudo vazio", () => {
    const messages = getValidationMessages(() =>
      new Resource(makeState({ content: "" })).validate(),
    );

    expect(messages).toEqual(["idea.resource.content.required"]);
  });

  it("rejeita conteudo longo demais e aceita o limite", () => {
    const messages = getValidationMessages(() =>
      new Resource(makeState({ content: "a".repeat(20001) })).validate(),
    );

    expect(messages).toEqual(["idea.resource.content.max.length"]);
    expect(() =>
      new Resource(makeState({ content: "a".repeat(20000) })).validate(),
    ).not.toThrow();
  });

  it("rejeita posicao ausente", () => {
    const messages = getValidationMessages(() =>
      new Resource(makeState({ position: undefined as never })).validate(),
    );

    expect(messages).toEqual(["idea.resource.position.required"]);
  });

  it("rejeita posicao negativa", () => {
    const messages = getValidationMessages(() =>
      new Resource(makeState({ position: -1 })).validate(),
    );

    expect(messages).toEqual(["idea.resource.position.min.value"]);
  });

  it("rejeita posicao nao inteira", () => {
    const messages = getValidationMessages(() =>
      new Resource(makeState({ position: 1.5 })).validate(),
    );

    expect(messages).toEqual(["idea.resource.position.integer"]);
  });
});
