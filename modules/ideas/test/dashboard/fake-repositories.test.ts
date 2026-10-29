import { Idea, IdeaType } from "../../src";
import { FakeIdeaRepository, FakeIdeaTypeRepository, FakeProcessingRepository, countByCreatedDay } from "../mock";
import { makeProcessing } from "../processing/factory";

const USER = "7c9e6679-7425-4f40-944b-e07fc1f90ae7";
const OTHER = "0b8f7a1e-3c52-4d6a-9f21-5a1e8c7d4b90";
const TYPE = "c3d2b1a0-9f8e-4d7c-8b6a-5f4e3d2c1b0a";
const NOW = new Date("2026-10-28T12:00:00Z");

function idea(over: Partial<ConstructorParameters<typeof Idea>[0]> = {}) {
  return new Idea({
    name: "App de receitas",
    description: "Aplicativo que sugere receitas.",
    objective: "Reduzir o desperdicio de comida.",
    ideaTypeId: TYPE,
    userId: USER,
    ...over,
  });
}

describe("countByCreatedDay", () => {
  it("agrupa por dia UTC e ignora o que ficou fora da janela", () => {
    const items = [
      { createdAt: new Date("2026-10-28T01:00:00Z") },
      { createdAt: new Date("2026-10-28T23:00:00Z") },
      { createdAt: new Date("2026-10-22T00:00:00Z") },
      { createdAt: new Date("2026-10-21T23:59:59Z") },
    ];

    expect(countByCreatedDay(items, 7, NOW)).toEqual([
      { date: "2026-10-28", count: 2 },
      { date: "2026-10-22", count: 1 },
    ]);
  });

  it("usa a data atual por padrao", () => {
    expect(countByCreatedDay([{ createdAt: new Date() }], 7)).toHaveLength(1);
  });
});

describe("FakeIdeaRepository (dashboard)", () => {
  it("conta so as ideias ativas do usuario", async () => {
    const deleted = idea({ deletedAt: new Date() });
    const repository = new FakeIdeaRepository([idea(), idea(), deleted, idea({ userId: OTHER })]);

    await expect(repository.countByUser(USER)).resolves.toBe(2);
  });

  it("lista as ultimas por updatedAt com o nome do tipo e respeita o limite", async () => {
    const old = idea({ name: "Antiga", updatedAt: new Date("2026-01-01") });
    const recent = idea({ name: "Recente", updatedAt: new Date("2026-03-01") });
    const unknown = idea({ name: "Sem tipo", ideaTypeId: OTHER, updatedAt: new Date("2026-02-01") });
    const repository = new FakeIdeaRepository([old, recent, unknown], { [TYPE]: "Roteiro" });

    const latest = await repository.findLatestByUser(USER, 2);

    expect(latest.map((item) => item.name)).toEqual(["Recente", "Sem tipo"]);
    expect(latest[0]).toEqual({
      id: recent.id,
      name: "Recente",
      ideaTypeId: TYPE,
      ideaTypeName: "Roteiro",
      updatedAt: recent.updatedAt,
    });
    expect(latest[1].ideaTypeName).toBe("");
  });

  it("conta criacoes por dia desconsiderando excluidas", async () => {
    const repository = new FakeIdeaRepository([idea(), idea({ deletedAt: new Date() })]);

    const daily = await repository.countDailyByUser(USER, 7);

    expect(daily).toEqual([{ date: new Date().toISOString().slice(0, 10), count: 1 }]);
  });
});

describe("FakeIdeaTypeRepository (dashboard)", () => {
  it("conta so os tipos ativos do usuario", async () => {
    const mk = (over = {}) =>
      new IdeaType({ name: "Tipo", description: "Descricao do tipo.", prompt: "Prompt", userId: USER, ...over });
    const repository = new FakeIdeaTypeRepository([mk(), mk({ deletedAt: new Date() }), mk({ userId: OTHER })]);

    await expect(repository.countByUser(USER)).resolves.toBe(1);
  });
});

describe("FakeProcessingRepository (dashboard)", () => {
  it("conta e agrupa por dia so do usuario", async () => {
    const repository = new FakeProcessingRepository([makeProcessing({ userId: USER }), makeProcessing({ userId: USER }), makeProcessing({ userId: OTHER })]);

    await expect(repository.countByUser(USER)).resolves.toBe(2);
    await expect(repository.countDailyByUser(USER, 7)).resolves.toEqual([
      { date: new Date().toISOString().slice(0, 10), count: 2 },
    ]);
  });
});
