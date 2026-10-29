import { DomainError } from "@ideias/shared";
import { RefineProcessing } from "../../../src";
import { FakeAiProvider, FakeProcessingRepository } from "../../mock";
import { OTHER_ID, OWNER_ID, getAsyncMessages, makeIteration, makeProcessing } from "../factory";

function setup(iterationsCount = 1, ai = new FakeAiProvider(["# Novo"])) {
  const processing = makeProcessing({
    userId: OWNER_ID,
    promptTemplate: "orientacao",
    iterations: Array.from({ length: iterationsCount }, (_, i) => makeIteration(i, i ? "ajuste" : null)),
  });
  const repository = new FakeProcessingRepository([processing]);

  return { processing, repository, ai, useCase: new RefineProcessing(repository, ai) };
}

describe("RefineProcessing", () => {
  test("anexa a segunda e a terceira iteracao sem alterar as anteriores", async () => {
    const { processing, repository, ai, useCase } = setup();

    const second = await useCase.execute({ id: processing.id, userId: OWNER_ID, refinement: "mais curto" });
    const third = await useCase.execute({ id: processing.id, userId: OWNER_ID, refinement: "com exemplos" });

    const saved = (await repository.findById(processing.id))!;
    expect(second.position).toBe(1);
    expect(third.position).toBe(2);
    expect(saved.iterations.map((item) => item.result)).toEqual(["resultado 0", "# Novo", "# Novo"]);
    expect(saved.iterations[1].refinement).toBe("mais curto");
    expect(ai.calls[1].userMessage).toContain("Refinamento solicitado: mais curto");
    expect(ai.calls[1].userMessage).toContain("Refinamento atual: com exemplos");
    expect(ai.calls[0].systemPrompt).toBe("orientacao");
  });

  test.each([
    ["", "processing.refinement.required"],
    ["ab", "processing.refinement.min.length"],
    ["a".repeat(2001), "processing.refinement.max.length"],
  ])("rejeita refinamento %#", async (refinement, expected) => {
    const { processing, ai, useCase } = setup();

    const errors = await getAsyncMessages(
      useCase.execute({ id: processing.id, userId: OWNER_ID, refinement }),
    );

    expect(errors).toEqual([expected]);
    expect(ai.calls).toEqual([]);
  });

  test("responde 404 para inexistente e para processamento alheio", async () => {
    const { processing, useCase } = setup();

    await expect(
      useCase.execute({ id: "x", userId: OWNER_ID, refinement: "refinar" }),
    ).rejects.toMatchObject({ statusCode: 404, message: "processing.not_found" });
    await expect(
      useCase.execute({ id: processing.id, userId: OTHER_ID, refinement: "refinar" }),
    ).rejects.toMatchObject({ statusCode: 404, message: "processing.not_found" });
  });

  test("respeita o limite de 50 iteracoes", async () => {
    const { processing, repository, ai, useCase } = setup(50);

    await expect(
      useCase.execute({ id: processing.id, userId: OWNER_ID, refinement: "refinar" }),
    ).rejects.toMatchObject({ statusCode: 422, message: "processing.iterations.too_many" });
    expect(ai.calls).toEqual([]);
    expect((await repository.findById(processing.id))!.iterations).toHaveLength(50);
  });

  test("mantem o historico quando a IA falha", async () => {
    const ai = new FakeAiProvider();
    ai.failWith = new DomainError("ai.generate.failed", 502);
    const { processing, repository, useCase } = setup(2, ai);

    await expect(
      useCase.execute({ id: processing.id, userId: OWNER_ID, refinement: "refinar" }),
    ).rejects.toMatchObject({ statusCode: 502 });
    expect((await repository.findById(processing.id))!.iterations).toHaveLength(2);
  });

  test("nao salva quando o resultado e invalido", async () => {
    const { processing, repository, useCase } = setup(1, new FakeAiProvider([""]));

    const errors = await getAsyncMessages(
      useCase.execute({ id: processing.id, userId: OWNER_ID, refinement: "refinar" }),
    );

    expect(errors).toEqual(["processing.iteration.result.required"]);
    expect((await repository.findById(processing.id))!.iterations).toHaveLength(1);
  });
});
