import { Idea, Resource } from "../../src";
import { FakeIdeaRepository } from "../mock";

const USER_ID = "7c9e6679-7425-4f40-944b-e07fc1f90ae7";
const TYPE_ID = "0b8f7a1e-3c52-4d6a-9f21-5a1e8c7d4b90";

function makeResource(content: string, position: number, id?: string) {
  return new Resource({ id, type: "text", content, position });
}

function makeIdea(resources: Resource[] = []): Idea {
  return new Idea({
    name: "App de receitas",
    description: "Aplicativo que sugere receitas com o que ha na geladeira.",
    objective: "Reduzir o desperdicio de comida em casa.",
    ideaTypeId: TYPE_ID,
    userId: USER_ID,
    resources,
  });
}

describe("FakeIdeaRepository com recursos", () => {
  it("persiste os recursos no create e devolve ordenados no findById", async () => {
    const repository = new FakeIdeaRepository();
    const idea = makeIdea([makeResource("b", 1), makeResource("a", 0)]);

    await repository.create(idea);
    const found = await repository.findById(idea.id);

    expect(found?.resources.map((item) => item.content)).toEqual(["a", "b"]);
  });

  it("findById devolve null quando nao existe", async () => {
    const repository = new FakeIdeaRepository();

    await expect(repository.findById("x")).resolves.toBeNull();
  });

  it("findPage nao devolve recursos", async () => {
    const idea = makeIdea([makeResource("a", 0)]);
    const repository = new FakeIdeaRepository([idea]);

    const page = await repository.findPage({ userId: USER_ID, page: 1, perPage: 10 });

    expect(page.items).toHaveLength(1);
    expect(page.items[0].resources).toEqual([]);
  });

  it("update adiciona, altera e remove recursos no mesmo envio", async () => {
    const kept = makeResource("mantido", 0);
    const removed = makeResource("removido", 1);
    const idea = makeIdea([kept, removed]);
    const repository = new FakeIdeaRepository([idea]);

    await repository.update(
      idea.clone({
        resources: [
          makeResource("alterado", 0, kept.id),
          makeResource("novo", 1),
        ],
      }),
    );

    const found = await repository.findById(idea.id);

    expect(found?.resources.map((item) => item.content)).toEqual(["alterado", "novo"]);
    expect(found?.resources.map((item) => item.id)).not.toContain(removed.id);
  });

  it("update falha quando a ideia nao existe", async () => {
    const repository = new FakeIdeaRepository();

    await expect(repository.update(makeIdea())).rejects.toThrow("was not found");
  });
});
