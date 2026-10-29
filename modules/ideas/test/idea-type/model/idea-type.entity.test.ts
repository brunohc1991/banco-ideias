import { ValidationException } from "@ideias/shared";
import { IdeaType, IdeaTypeState } from "../../../src";

const USER_ID = "7c9e6679-7425-4f40-944b-e07fc1f90ae7";

function makeState(overrides: Partial<IdeaTypeState> = {}): IdeaTypeState {
  return {
    name: "Roteiro viral",
    description: "Transforma uma ideia em roteiro curto.",
    prompt: "Crie um roteiro viral sobre {{name}}: {{description}}.",
    userId: USER_ID,
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

describe("IdeaType", () => {
  it("cria uma entidade valida e expoe os getters", () => {
    const ideaType = new IdeaType(makeState());

    expect(ideaType.name).toBe("Roteiro viral");
    expect(ideaType.description).toBe("Transforma uma ideia em roteiro curto.");
    expect(ideaType.prompt).toContain("{{name}}");
    expect(ideaType.userId).toBe(USER_ID);
    expect(ideaType.id).toBeDefined();
    expect(ideaType.deletedAt).toBeNull();
  });

  it("e lazy: permite existir invalida antes do validate()", () => {
    const ideaType = new IdeaType(makeState({ name: "" }));

    expect(ideaType.name).toBe("");
    expect(() => ideaType.validate()).toThrow(ValidationException);
  });

  it("valida com sucesso dados validos", () => {
    expect(() => new IdeaType(makeState()).validate()).not.toThrow();
  });

  it("aceita prompt sem marcadores", () => {
    expect(() =>
      new IdeaType(makeState({ prompt: "x".repeat(20) })).validate(),
    ).not.toThrow();
  });

  it("clone preserva id e atualiza campos", () => {
    const ideaType = new IdeaType(makeState());
    const cloned = ideaType.clone({ name: "Resumo de conteudo" });

    expect(cloned.id).toBe(ideaType.id);
    expect(cloned.name).toBe("Resumo de conteudo");
    expect(ideaType.equals(cloned)).toBe(true);
  });

  describe.each([
    ["name", 3, 120],
    ["description", 10, 500],
    ["prompt", 20, 8000],
  ] as const)("%s", (field, min, max) => {
    it("rejeita vazio com required", () => {
      const messages = getValidationMessages(() =>
        new IdeaType(makeState({ [field]: "" })).validate(),
      );

      expect(messages).toContain(`idea-type.${field}.required`);
    });

    it("rejeita abaixo do minimo", () => {
      const messages = getValidationMessages(() =>
        new IdeaType(makeState({ [field]: "a".repeat(min - 1) })).validate(),
      );

      expect(messages).toEqual([`idea-type.${field}.min.length`]);
    });

    it("rejeita acima do maximo", () => {
      const messages = getValidationMessages(() =>
        new IdeaType(makeState({ [field]: "a".repeat(max + 1) })).validate(),
      );

      expect(messages).toEqual([`idea-type.${field}.max.length`]);
    });

    it("aceita exatamente os limites", () => {
      expect(() =>
        new IdeaType(makeState({ [field]: "a".repeat(min) })).validate(),
      ).not.toThrow();
      expect(() =>
        new IdeaType(makeState({ [field]: "a".repeat(max) })).validate(),
      ).not.toThrow();
    });
  });

  describe("userId", () => {
    it("rejeita vazio", () => {
      const messages = getValidationMessages(() =>
        new IdeaType(makeState({ userId: "" })).validate(),
      );

      expect(messages).toContain("idea-type.userId.required");
    });

    it("rejeita uuid invalido", () => {
      const messages = getValidationMessages(() =>
        new IdeaType(makeState({ userId: "abc" })).validate(),
      );

      expect(messages).toEqual(["idea-type.userId.uuid"]);
    });
  });

  it("acumula erros de varios campos", () => {
    const messages = getValidationMessages(() =>
      new IdeaType(makeState({ name: "A", description: "B", prompt: "C" })).validate(),
    );

    expect(messages).toEqual([
      "idea-type.name.min.length",
      "idea-type.description.min.length",
      "idea-type.prompt.min.length",
    ]);
  });
});
