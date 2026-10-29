import { DomainError } from "@ideias/shared";
import { DeleteIdea, Idea, Processing, ProcessingIteration, Resource } from "../../../src";
import { FakeIdeaRepository, FakeProcessingRepository } from "../../mock";

const OWNER_ID = "7c9e6679-7425-4f40-944b-e07fc1f90ae7";
const OTHER_ID = "0b8f7a1e-3c52-4d6a-9f21-5a1e8c7d4b90";
const TYPE_ID = "c3d2b1a0-9f8e-4d7c-8b6a-5f4e3d2c1b0a";

function makeIdea(userId = OWNER_ID, resources: Resource[] = []): Idea {
  return new Idea({
    name: "App de receitas",
    description: "Aplicativo que sugere receitas com o que ha na geladeira.",
    objective: "Reduzir o desperdicio de comida em casa.",
    ideaTypeId: TYPE_ID,
    userId,
    resources,
  });
}

function setup(initial: Idea[] = [], processings: Processing[] = []) {
  const repository = new FakeIdeaRepository(initial);
  const processingRepository = new FakeProcessingRepository(processings);
  const useCase = new DeleteIdea(repository, processingRepository);

  return { repository, processingRepository, useCase };
}

function makeProcessing(idea: Idea): Processing {
  return new Processing({
    userId: idea.userId,
    ideaId: idea.id,
    ideaName: idea.name,
    ideaDescription: idea.description,
    ideaObjective: idea.objective,
    ideaTypeId: TYPE_ID,
    ideaTypeName: "Roteiro",
    promptTemplate: "Prompt",
    iterations: [new ProcessingIteration({ result: "ok", position: 0 })],
  });
}

describe("DeleteIdea", () => {
  test("deve recusar com 409 a ideia que tem processamentos", async () => {
    const idea = makeIdea();
    const { repository, useCase } = setup([idea], [makeProcessing(idea)]);

    await expect(useCase.execute({ id: idea.id, userId: OWNER_ID })).rejects.toMatchObject({
      statusCode: 409,
      message: "idea.has_processings",
    });
    expect(repository.ideas).toHaveLength(1);
  });

  test("deve excluir depois que os processamentos forem apagados", async () => {
    const idea = makeIdea();
    const { repository, processingRepository, useCase } = setup([idea], [makeProcessing(idea)]);

    await processingRepository.delete(processingRepository.processings[0].id);
    await useCase.execute({ id: idea.id, userId: OWNER_ID });

    expect(repository.ideas).toEqual([]);
  });

  test("deve excluir a ideia junto com os recursos", async () => {
    const idea = makeIdea(OWNER_ID, [
      new Resource({ type: "text", content: "Apoio", position: 0 }),
    ]);
    const { repository, useCase } = setup([idea]);

    await useCase.execute({ id: idea.id, userId: OWNER_ID });

    expect(repository.ideas).toEqual([]);
    await expect(repository.findById(idea.id)).resolves.toBeNull();
  });

  test("deve excluir a ideia do proprio usuario", async () => {
    const idea = makeIdea();
    const { repository, useCase } = setup([idea]);

    await expect(
      useCase.execute({ id: idea.id, userId: OWNER_ID }),
    ).resolves.toBeUndefined();

    expect(repository.ideas).toEqual([]);
  });

  test("deve responder 404 quando o id nao existe", async () => {
    const { useCase } = setup();

    const promise = useCase.execute({
      id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
      userId: OWNER_ID,
    });

    await expect(promise).rejects.toThrow(DomainError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 404,
      message: "idea.not_found",
    });
  });

  test("deve responder 403 e manter o registro de outro usuario", async () => {
    const idea = makeIdea(OTHER_ID);
    const { repository, useCase } = setup([idea]);

    const promise = useCase.execute({ id: idea.id, userId: OWNER_ID });

    await expect(promise).rejects.toMatchObject({
      statusCode: 403,
      message: "idea.forbidden",
    });
    expect(repository.ideas).toHaveLength(1);
  });
});
