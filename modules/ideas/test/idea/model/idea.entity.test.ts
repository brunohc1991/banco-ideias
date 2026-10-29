import { ValidationException } from "@ideias/shared";
import { Idea, IdeaState, Resource } from "../../../src";

const USER_ID = "7c9e6679-7425-4f40-944b-e07fc1f90ae7";
const TYPE_ID = "0b8f7a1e-3c52-4d6a-9f21-5a1e8c7d4b90";

function makeState(overrides: Partial<IdeaState> = {}): IdeaState {
  return {
    name: "App de receitas",
    description: "Aplicativo que sugere receitas com o que ha na geladeira.",
    objective: "Reduzir o desperdicio de comida em casa.",
    ideaTypeId: TYPE_ID,
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

function makeResource(overrides: Partial<ConstructorParameters<typeof Resource>[0]> = {}) {
  return new Resource({
    type: "text",
    content: "Referencia",
    position: 0,
    ...overrides,
  });
}

describe("Idea", () => {
  it("cria uma entidade valida e expoe os getters", () => {
    const idea = new Idea(makeState());

    expect(idea.name).toBe("App de receitas");
    expect(idea.description).toContain("receitas");
    expect(idea.objective).toContain("desperdicio");
    expect(idea.ideaTypeId).toBe(TYPE_ID);
    expect(idea.userId).toBe(USER_ID);
    expect(idea.id).toBeDefined();
    expect(idea.deletedAt).toBeNull();
  });

  it("e lazy: permite existir invalida antes do validate()", () => {
    const idea = new Idea(makeState({ name: "" }));

    expect(idea.name).toBe("");
    expect(() => idea.validate()).toThrow(ValidationException);
  });

  it("valida com sucesso dados validos", () => {
    expect(() => new Idea(makeState()).validate()).not.toThrow();
  });

  it("rejeita id invalido", () => {
    const messages = getValidationMessages(() =>
      new Idea(makeState({ id: "abc" })).validate(),
    );

    expect(messages).toEqual(["id.uuid"]);
  });

  it("clone preserva id e atualiza campos", () => {
    const idea = new Idea(makeState());
    const cloned = idea.clone({ name: "Outro nome" });

    expect(cloned.id).toBe(idea.id);
    expect(cloned.name).toBe("Outro nome");
    expect(idea.equals(cloned)).toBe(true);
  });

  describe.each([
    ["name", 3, 120],
    ["description", 10, 2000],
    ["objective", 10, 1000],
  ] as const)("%s", (field, min, max) => {
    it("rejeita vazio com required", () => {
      const messages = getValidationMessages(() =>
        new Idea(makeState({ [field]: "" })).validate(),
      );

      expect(messages).toContain(`idea.${field}.required`);
    });

    it("rejeita abaixo do minimo", () => {
      const messages = getValidationMessages(() =>
        new Idea(makeState({ [field]: "a".repeat(min - 1) })).validate(),
      );

      expect(messages).toEqual([`idea.${field}.min.length`]);
    });

    it("rejeita acima do maximo", () => {
      const messages = getValidationMessages(() =>
        new Idea(makeState({ [field]: "a".repeat(max + 1) })).validate(),
      );

      expect(messages).toEqual([`idea.${field}.max.length`]);
    });

    it("aceita exatamente os limites", () => {
      expect(() =>
        new Idea(makeState({ [field]: "a".repeat(min) })).validate(),
      ).not.toThrow();
      expect(() =>
        new Idea(makeState({ [field]: "a".repeat(max) })).validate(),
      ).not.toThrow();
    });
  });

  describe.each(["ideaTypeId", "userId"] as const)("%s", (field) => {
    it("rejeita vazio", () => {
      const messages = getValidationMessages(() =>
        new Idea(makeState({ [field]: "" })).validate(),
      );

      expect(messages).toContain(`idea.${field}.required`);
    });

    it("rejeita uuid invalido", () => {
      const messages = getValidationMessages(() =>
        new Idea(makeState({ [field]: "abc" })).validate(),
      );

      expect(messages).toEqual([`idea.${field}.uuid`]);
    });
  });

  it("acumula erros de varios campos", () => {
    const messages = getValidationMessages(() =>
      new Idea(makeState({ name: "A", description: "B", objective: "C" })).validate(),
    );

    expect(messages).toEqual([
      "idea.name.min.length",
      "idea.description.min.length",
      "idea.objective.min.length",
    ]);
  });

  describe("resources", () => {
    it("assume lista vazia por padrao", () => {
      const idea = new Idea(makeState());

      expect(idea.resources).toEqual([]);
      expect(() => idea.validate()).not.toThrow();
    });

    it("aceita 20 recursos", () => {
      const resources = Array.from({ length: 20 }, (_, position) =>
        makeResource({ position }),
      );
      const idea = new Idea(makeState({ resources }));

      expect(idea.resources).toHaveLength(20);
      expect(() => idea.validate()).not.toThrow();
    });

    it("rejeita 21 recursos", () => {
      const resources = Array.from({ length: 21 }, (_, position) =>
        makeResource({ position }),
      );
      const messages = getValidationMessages(() =>
        new Idea(makeState({ resources })).validate(),
      );

      expect(messages).toEqual(["idea.resources.too_many"]);
    });

    it("rejeita ids repetidos", () => {
      const first = makeResource();
      const second = makeResource({ id: first.id, position: 1 });
      const messages = getValidationMessages(() =>
        new Idea(makeState({ resources: [first, second] })).validate(),
      );

      expect(messages).toEqual(["idea.resources.duplicate_id"]);
    });

    it("delega a validacao a cada recurso", () => {
      const messages = getValidationMessages(() =>
        new Idea(
          makeState({
            resources: [makeResource({ content: "" }), makeResource({ position: -1 })],
          }),
        ).validate(),
      );

      expect(messages).toEqual([
        "idea.resource.content.required",
        "idea.resource.position.min.value",
      ]);
    });

    it("propaga erros que nao sao de validacao", () => {
      const resource = makeResource();
      jest.spyOn(resource, "validate").mockImplementation(() => {
        throw new Error("boom");
      });

      expect(() =>
        new Idea(makeState({ resources: [resource] })).validate(),
      ).toThrow("boom");
    });
  });
});
