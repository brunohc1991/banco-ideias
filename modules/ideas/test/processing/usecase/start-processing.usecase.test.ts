import { DomainError } from "@ideias/shared";
import { Idea, IdeaType, Resource, StartProcessing } from "../../../src";
import {
  FakeAiProvider,
  FakeIdeaRepository,
  FakeIdeaTypeRepository,
  FakeProcessingRepository,
} from "../../mock";
import { OTHER_ID, OWNER_ID, getAsyncMessages } from "../factory";

const TYPE = new IdeaType({
  name: "Roteiro viral",
  description: "Transforma uma ideia em roteiro curto.",
  prompt: "Roteiro sobre {{name}} ({{objective}}).\n{{resources}}",
  userId: OWNER_ID,
});

function makeIdea(overrides: { userId?: string; ideaTypeId?: string; resources?: Resource[] } = {}) {
  return new Idea({
    name: "App de receitas",
    description: "Aplicativo que sugere receitas com o que ha na geladeira.",
    objective: "Reduzir o desperdicio de comida em casa.",
    ideaTypeId: TYPE.id,
    userId: OWNER_ID,
    ...overrides,
  });
}

function setup(ideas: Idea[], ai = new FakeAiProvider(["# Primeiro"])) {
  const ideaRepository = new FakeIdeaRepository(ideas);
  const processingRepository = new FakeProcessingRepository();
  const useCase = new StartProcessing(
    ideaRepository,
    new FakeIdeaTypeRepository([TYPE]),
    processingRepository,
    ai,
  );

  return { ai, ideaRepository, processingRepository, useCase };
}

describe("StartProcessing", () => {
  test("cria o processamento de uma ideia sem recursos", async () => {
    const idea = makeIdea();
    const { ai, processingRepository, useCase } = setup([idea]);

    const processing = await useCase.execute({ ideaId: idea.id, userId: OWNER_ID });

    expect(processing.iterations).toHaveLength(1);
    expect(processing.iterations[0].position).toBe(0);
    expect(processing.iterations[0].refinement).toBeNull();
    expect(processing.iterations[0].result).toBe("# Primeiro");
    expect(processing.resources).toEqual([]);
    expect(processingRepository.processings).toHaveLength(1);
    expect(ai.calls[0]).toEqual({
      systemPrompt: "Roteiro sobre App de receitas (Reduzir o desperdicio de comida em casa.).\n",
      userMessage: "Gere o primeiro resultado para esta Ideia.",
    });
  });

  test("copia o snapshot com 3 recursos e compoe a lista numerada", async () => {
    const idea = makeIdea({
      resources: ["a", "b", "c"].map(
        (content, position) => new Resource({ type: "text", content, position }),
      ),
    });
    const { ai, useCase } = setup([idea]);

    const processing = await useCase.execute({ ideaId: idea.id, userId: OWNER_ID });

    expect(processing.resources.map((item) => item.content)).toEqual(["a", "b", "c"]);
    expect(processing.ideaTypeName).toBe("Roteiro viral");
    expect(processing.promptTemplate).toBe(TYPE.prompt);
    expect(ai.calls[0].systemPrompt).toContain("1. a\n2. b\n3. c");
  });

  test("o snapshot nao muda quando a ideia e editada depois", async () => {
    const idea = makeIdea();
    const { ideaRepository, useCase } = setup([idea]);

    const processing = await useCase.execute({ ideaId: idea.id, userId: OWNER_ID });
    await ideaRepository.update(idea.clone({ name: "Nome editado" }));

    expect(processing.ideaName).toBe("App de receitas");
  });

  test.each([
    ["inexistente", () => ({ ideaId: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5e", ideas: [] as Idea[] })],
    ["de outro usuario", () => {
      const idea = makeIdea({ userId: OTHER_ID });
      return { ideaId: idea.id, ideas: [idea] };
    }],
    ["com tipo inexistente", () => {
      const idea = makeIdea({ ideaTypeId: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d" });
      return { ideaId: idea.id, ideas: [idea] };
    }],
  ])("rejeita ideia %s com 422 sem salvar", async (_name, build) => {
    const { ideaId, ideas } = build();
    const { ai, processingRepository, useCase } = setup(ideas);

    await expect(useCase.execute({ ideaId, userId: OWNER_ID })).rejects.toMatchObject({
      statusCode: 422,
      message: "processing.idea.invalid",
    });
    expect(processingRepository.processings).toEqual([]);
    expect(ai.calls).toEqual([]);
  });

  test("nao salva nada quando a IA falha", async () => {
    const idea = makeIdea();
    const ai = new FakeAiProvider();
    ai.failWith = new DomainError("ai.generate.failed", 502);
    const { processingRepository, useCase } = setup([idea], ai);

    await expect(useCase.execute({ ideaId: idea.id, userId: OWNER_ID })).rejects.toMatchObject({
      statusCode: 502,
      message: "ai.generate.failed",
    });
    expect(processingRepository.processings).toEqual([]);
  });

  test("nao salva quando o resultado e invalido", async () => {
    const idea = makeIdea();
    const { processingRepository, useCase } = setup([idea], new FakeAiProvider([""]));

    const errors = await getAsyncMessages(useCase.execute({ ideaId: idea.id, userId: OWNER_ID }));

    expect(errors).toEqual(["processing.iteration.result.required"]);
    expect(processingRepository.processings).toEqual([]);
  });
});
