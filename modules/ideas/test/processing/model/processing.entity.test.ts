import { Processing, ProcessingIteration } from "../../../src";
import { getMessages, makeIteration, makeProcessing, makeProcessingState } from "../factory";

describe("ProcessingIteration", () => {
  it("expoe os getters e aceita refinamento nulo", () => {
    const iteration = new ProcessingIteration({ result: "texto", position: 2 });

    expect(iteration.refinement).toBeNull();
    expect(iteration.result).toBe("texto");
    expect(iteration.position).toBe(2);
    expect(() => iteration.validate()).not.toThrow();
  });

  it.each([
    ["", ["processing.refinement.required"]],
    ["ab", ["processing.refinement.min.length"]],
    ["a".repeat(2001), ["processing.refinement.max.length"]],
  ])("valida refinamento %#", (refinement, expected) => {
    expect(getMessages(() => makeIteration(1, refinement).validate())).toEqual(expected);
  });

  it("aceita refinamento nos limites", () => {
    expect(() => makeIteration(1, "abc").validate()).not.toThrow();
    expect(() => makeIteration(1, "a".repeat(2000)).validate()).not.toThrow();
  });

  it("valida resultado e posicao", () => {
    expect(
      getMessages(() => new ProcessingIteration({ result: "", position: 0 }).validate()),
    ).toEqual(["processing.iteration.result.required"]);
    expect(
      getMessages(() => new ProcessingIteration({ result: "a".repeat(50001), position: 0 }).validate()),
    ).toEqual(["processing.iteration.result.max.length"]);
    expect(
      getMessages(() => new ProcessingIteration({ result: "x", position: -1 }).validate()),
    ).toEqual(["processing.iteration.position.min.value"]);
    expect(
      getMessages(() => new ProcessingIteration({ result: "x", position: 1.5 }).validate()),
    ).toEqual(["processing.iteration.position.integer"]);
  });
});

describe("Processing", () => {
  it("cria valida e expoe os getters", () => {
    const processing = makeProcessing({
      resources: [{ type: "text", content: "apoio", position: 0 }],
    });

    expect(processing.userId).toBeDefined();
    expect(processing.ideaId).toBeDefined();
    expect(processing.ideaName).toBe("App de receitas");
    expect(processing.ideaDescription).toContain("receitas");
    expect(processing.ideaObjective).toContain("desperdicio");
    expect(processing.ideaTypeId).toBeDefined();
    expect(processing.ideaTypeName).toBe("Roteiro viral");
    expect(processing.promptTemplate).toContain("{{name}}");
    expect(processing.resources).toHaveLength(1);
    expect(processing.iterations).toHaveLength(1);
    expect(() => processing.validate()).not.toThrow();
  });

  it("assume colecoes vazias por padrao", () => {
    const processing = new Processing({ ...makeProcessingState(), resources: undefined, iterations: undefined });

    expect(processing.resources).toEqual([]);
    expect(processing.iterations).toEqual([]);
  });

  it.each([
    ["userId", "", "processing.userId.required"],
    ["userId", "abc", "processing.userId.uuid"],
    ["ideaId", "abc", "processing.ideaId.uuid"],
    ["ideaTypeId", "abc", "processing.ideaTypeId.uuid"],
    ["ideaName", "", "processing.ideaName.required"],
    ["ideaName", "a".repeat(121), "processing.ideaName.max.length"],
    ["ideaDescription", "", "processing.ideaDescription.required"],
    ["ideaDescription", "a".repeat(2001), "processing.ideaDescription.max.length"],
    ["ideaObjective", "", "processing.ideaObjective.required"],
    ["ideaObjective", "a".repeat(1001), "processing.ideaObjective.max.length"],
    ["ideaTypeName", "", "processing.ideaTypeName.required"],
    ["promptTemplate", "", "processing.promptTemplate.required"],
  ])("valida %s", (field, value, expected) => {
    expect(getMessages(() => makeProcessing({ [field]: value }).validate())).toEqual([expected]);
  });

  it("valida o snapshot de recursos", () => {
    const messages = getMessages(() =>
      makeProcessing({
        resources: [{ type: "image", content: "", position: -1 }],
      }).validate(),
    );

    expect(messages).toEqual([
      "processing.resource.type.in",
      "processing.resource.content.required",
      "processing.resource.position.min.value",
    ]);
    expect(
      getMessages(() =>
        makeProcessing({ resources: [{ type: "text", content: "x", position: 0.5 }] }).validate(),
      ),
    ).toEqual(["processing.resource.position.integer"]);
  });

  it("exige ao menos uma iteracao", () => {
    expect(getMessages(() => makeProcessing({ iterations: [] }).validate())).toEqual([
      "processing.iterations.required",
    ]);
  });

  it("aceita 50 e rejeita 51 iteracoes", () => {
    const build = (n: number) => Array.from({ length: n }, (_, i) => makeIteration(i));

    expect(() => makeProcessing({ iterations: build(50) }).validate()).not.toThrow();
    expect(getMessages(() => makeProcessing({ iterations: build(51) }).validate())).toEqual([
      "processing.iterations.too_many",
    ]);
  });

  it("delega a validacao a cada iteracao", () => {
    const messages = getMessages(() =>
      makeProcessing({
        iterations: [
          new ProcessingIteration({ result: "", position: 0 }),
          new ProcessingIteration({ result: "ok", position: -1 }),
        ],
      }).validate(),
    );

    expect(messages).toEqual([
      "processing.iteration.result.required",
      "processing.iteration.position.min.value",
    ]);
  });

  it("propaga erros que nao sao de validacao", () => {
    const iteration = makeIteration();
    jest.spyOn(iteration, "validate").mockImplementation(() => {
      throw new Error("boom");
    });

    expect(() => makeProcessing({ iterations: [iteration] }).validate()).toThrow("boom");
  });
});
