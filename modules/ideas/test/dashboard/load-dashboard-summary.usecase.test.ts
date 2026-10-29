import { Idea, IdeaType, LoadDashboardSummary } from "../../src";
import { FakeIdeaRepository, FakeIdeaTypeRepository, FakeProcessingRepository } from "../mock";
import { makeProcessing } from "../processing/factory";

const USER = "7c9e6679-7425-4f40-944b-e07fc1f90ae7";
const OTHER = "0b8f7a1e-3c52-4d6a-9f21-5a1e8c7d4b90";
const NOW = new Date("2026-10-28T12:00:00Z");

const TYPE = new IdeaType({ name: "Roteiro", description: "Roteiro curto.", prompt: "Prompt", userId: USER });

function idea(createdAt: string, over: Partial<ConstructorParameters<typeof Idea>[0]> = {}) {
  return new Idea({
    name: "Ideia " + createdAt,
    description: "Aplicativo que sugere receitas.",
    objective: "Reduzir o desperdicio de comida.",
    ideaTypeId: TYPE.id,
    userId: USER,
    createdAt: new Date(createdAt),
    updatedAt: new Date(createdAt),
    ...over,
  });
}

function processing(createdAt: string) {
  return makeProcessing({ userId: USER, createdAt: new Date(createdAt), updatedAt: new Date(createdAt) });
}

function setup(ideas: Idea[] = [], processings = [] as ReturnType<typeof processing>[]) {
  const ideaRepository = new FakeIdeaRepository(ideas, { [TYPE.id]: TYPE.name });
  const typeRepository = new FakeIdeaTypeRepository([TYPE]);
  const processingRepository = new FakeProcessingRepository(processings);

  return {
    ideaRepository,
    typeRepository,
    processingRepository,
    useCase: new LoadDashboardSummary(ideaRepository, typeRepository, processingRepository),
  };
}

describe("LoadDashboardSummary", () => {
  test("devolve contagens, ultimas ideias e atividade de 7 dias", async () => {
    const { useCase } = setup(
      [
        idea("2026-10-28T10:00:00Z"),
        idea("2026-10-28T11:00:00Z"),
        idea("2026-10-24T09:00:00Z"),
        idea("2026-10-28T08:00:00Z", { userId: OTHER }),
      ],
      [processing("2026-10-28T09:00:00Z"), processing("2026-10-23T09:00:00Z")],
    );

    const summary = await useCase.execute({ userId: USER, now: NOW });

    expect(summary.stats).toEqual({ ideasCount: 3, ideaTypesCount: 1, processingsCount: 2 });
    expect(summary.latestIdeas.map((item) => item.name)).toEqual([
      "Ideia 2026-10-28T11:00:00Z",
      "Ideia 2026-10-28T10:00:00Z",
      "Ideia 2026-10-24T09:00:00Z",
    ]);
    expect(summary.latestIdeas[0].ideaTypeName).toBe("Roteiro");
    expect(summary.activity).toEqual([
      { date: "2026-10-22", ideasCreated: 0, processingsExecuted: 0 },
      { date: "2026-10-23", ideasCreated: 0, processingsExecuted: 1 },
      { date: "2026-10-24", ideasCreated: 1, processingsExecuted: 0 },
      { date: "2026-10-25", ideasCreated: 0, processingsExecuted: 0 },
      { date: "2026-10-26", ideasCreated: 0, processingsExecuted: 0 },
      { date: "2026-10-27", ideasCreated: 0, processingsExecuted: 0 },
      { date: "2026-10-28", ideasCreated: 2, processingsExecuted: 1 },
    ]);
  });

  test("usuario sem dados tem tudo zerado e 7 dias em ordem crescente", async () => {
    const { useCase } = setup();

    const summary = await useCase.execute({ userId: OTHER, now: NOW });

    expect(summary.stats).toEqual({ ideasCount: 0, ideaTypesCount: 0, processingsCount: 0 });
    expect(summary.latestIdeas).toEqual([]);
    expect(summary.activity).toHaveLength(7);
    expect(summary.activity.every((item) => item.ideasCreated === 0 && item.processingsExecuted === 0)).toBe(true);
    expect(summary.activity.map((item) => item.date)).toEqual([...summary.activity.map((item) => item.date)].sort());
  });

  test("usa a data atual quando `now` nao e informado", async () => {
    const { useCase } = setup();

    const summary = await useCase.execute({ userId: USER });

    expect(summary.activity[6].date).toBe(new Date().toISOString().slice(0, 10));
  });

  test("limite padrao e 5; 1 e 20 sao validos", async () => {
    const ideas = Array.from({ length: 25 }, (_, i) => idea(`2026-10-${String(i + 1).padStart(2, "0")}T10:00:00Z`));
    const { useCase } = setup(ideas);

    expect((await useCase.execute({ userId: USER, now: NOW })).latestIdeas).toHaveLength(5);
    expect((await useCase.execute({ userId: USER, now: NOW, latestLimit: 1 })).latestIdeas).toHaveLength(1);
    expect((await useCase.execute({ userId: USER, now: NOW, latestLimit: 20 })).latestIdeas).toHaveLength(20);
  });

  test.each([0, 21, 3.5, Number.NaN, -1])("rejeita limite %p com 422", async (latestLimit) => {
    const { useCase } = setup();

    await expect(useCase.execute({ userId: USER, latestLimit })).rejects.toMatchObject({
      statusCode: 422,
      message: "dashboard.latestLimit.invalid",
    });
  });

  test("dispara as seis leituras em paralelo", async () => {
    const { ideaRepository, typeRepository, processingRepository, useCase } = setup();
    const started: string[] = [];
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    const track = <T>(name: string, value: T) => async () => {
      started.push(name);
      await gate;
      return value;
    };

    ideaRepository.countByUser = track("ideas", 0);
    typeRepository.countByUser = track("types", 0);
    processingRepository.countByUser = track("processings", 0);
    ideaRepository.findLatestByUser = track("latest", []);
    ideaRepository.countDailyByUser = track("ideasDaily", []);
    processingRepository.countDailyByUser = track("processingsDaily", []);

    const promise = useCase.execute({ userId: USER, now: NOW });
    await Promise.resolve();

    expect(started).toHaveLength(6);

    release();
    await promise;
  });
});
