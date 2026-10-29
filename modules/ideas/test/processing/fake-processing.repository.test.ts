import { FakeProcessingRepository } from "../mock";
import { OTHER_ID, OWNER_ID, makeIteration, makeProcessing } from "./factory";

describe("FakeProcessingRepository", () => {
  it("lista paginado so do usuario com contagem de iteracoes", async () => {
    const mine = makeProcessing({ iterations: [makeIteration(0), makeIteration(1)] });
    const repository = new FakeProcessingRepository([mine, makeProcessing({ userId: OTHER_ID })]);

    const page = await repository.findPage({ userId: OWNER_ID, page: 0, perPage: 0 });

    expect(page.total).toBe(1);
    expect(page.items).toHaveLength(1);
    expect(page.items[0]).toMatchObject({ id: mine.id, iterationsCount: 2 });
  });

  it("appendIteration falha para processamento inexistente", async () => {
    await expect(
      new FakeProcessingRepository().appendIteration("x", makeIteration()),
    ).rejects.toThrow("was not found");
  });

  it("findById devolve null quando nao existe", async () => {
    await expect(new FakeProcessingRepository().findById("x")).resolves.toBeNull();
  });

  it("busca ideias por nome ou tipo, sem diferenciar maiusculas, limitando a 20", async () => {
    const mk = (i: number, userId = OWNER_ID, name = `Ideia ${i}`, type = "Roteiro") => ({
      id: `id-${i}`,
      name,
      ideaTypeId: "t",
      ideaTypeName: type,
      userId,
      updatedAt: new Date(2026, 0, i + 1),
    });
    const ideas = [
      ...Array.from({ length: 25 }, (_, i) => mk(i)),
      mk(100, OTHER_ID),
      mk(101, OWNER_ID, "Receitas", "Resumo"),
    ];
    const repository = new FakeProcessingRepository([], ideas);

    expect(await repository.searchIdeas({ userId: OWNER_ID, term: "" })).toHaveLength(20);
    expect((await repository.searchIdeas({ userId: OWNER_ID, term: "" }))[0].id).toBe("id-101");
    expect(await repository.searchIdeas({ userId: OWNER_ID, term: "RECEI" })).toEqual([
      { id: "id-101", name: "Receitas", ideaTypeId: "t", ideaTypeName: "Resumo" },
    ]);
    expect(await repository.searchIdeas({ userId: OWNER_ID, term: "resumo" })).toHaveLength(1);
  });

  it("existsByIdeaId", async () => {
    const processing = makeProcessing();
    const repository = new FakeProcessingRepository([processing]);

    await expect(repository.existsByIdeaId(processing.ideaId)).resolves.toBe(true);
    await expect(repository.existsByIdeaId("outra")).resolves.toBe(false);
  });
});
