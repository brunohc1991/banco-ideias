import { DEFAULT_IDEA_TYPES, IdeaType, LoadDefaultIdeaTypes } from "../../../src";
import { FakeIdeaTypeRepository } from "../../mock";

const USER_ID = "7c9e6679-7425-4f40-944b-e07fc1f90ae7";
const OTHER_ID = "0b8f7a1e-3c52-4d6a-9f21-5a1e8c7d4b90";

function makeIdeaType(userId: string): IdeaType {
  return new IdeaType({
    name: "Meu tipo",
    description: "Descricao do meu tipo.",
    prompt: "Prompt do meu tipo com mais de vinte caracteres.",
    userId,
  });
}

function setup(initial: IdeaType[] = []) {
  const repository = new FakeIdeaTypeRepository(initial);
  const useCase = new LoadDefaultIdeaTypes(repository);

  return { repository, useCase };
}

describe("LoadDefaultIdeaTypes", () => {
  test("deve carregar todos os tipos padrao para o usuario sem registros", async () => {
    const { repository, useCase } = setup();

    const output = await useCase.execute({ userId: USER_ID });

    expect(output).toEqual({ loaded: DEFAULT_IDEA_TYPES.length });
    expect(repository.ideaTypes).toHaveLength(DEFAULT_IDEA_TYPES.length);
    expect(repository.ideaTypes.every((item) => item.userId === USER_ID)).toBe(true);
    expect(repository.ideaTypes.map((item) => item.name)).toEqual(
      DEFAULT_IDEA_TYPES.map((item) => item.name),
    );
  });

  test("deve gerar ids distintos para cada tipo carregado", async () => {
    const { repository, useCase } = setup();

    await useCase.execute({ userId: USER_ID });

    const ids = repository.ideaTypes.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("nao deve fazer nada quando o usuario ja tem um tipo", async () => {
    const { repository, useCase } = setup([makeIdeaType(USER_ID)]);

    const output = await useCase.execute({ userId: USER_ID });

    expect(output).toEqual({ loaded: 0 });
    expect(repository.ideaTypes).toHaveLength(1);
  });

  test("nao deve duplicar em chamadas repetidas", async () => {
    const { repository, useCase } = setup();

    const first = await useCase.execute({ userId: USER_ID });
    const second = await useCase.execute({ userId: USER_ID });

    expect(first.loaded).toBe(DEFAULT_IDEA_TYPES.length);
    expect(second.loaded).toBe(0);
    expect(repository.ideaTypes).toHaveLength(DEFAULT_IDEA_TYPES.length);
  });

  test("nao deve ser bloqueado nem alterar tipos de outros usuarios", async () => {
    const other = makeIdeaType(OTHER_ID);
    const { repository, useCase } = setup([other]);

    const output = await useCase.execute({ userId: USER_ID });

    expect(output.loaded).toBe(DEFAULT_IDEA_TYPES.length);
    expect(repository.ideaTypes.filter((item) => item.userId === OTHER_ID)).toEqual([other]);
  });
});

describe("DEFAULT_IDEA_TYPES", () => {
  test("deve ter pelo menos os quatro tipos iniciais", () => {
    expect(DEFAULT_IDEA_TYPES.length).toBeGreaterThanOrEqual(4);
  });

  test.each(DEFAULT_IDEA_TYPES.map((item) => [item.name, item] as const))(
    "%s deve ser um Tipo de Ideia valido, multilinha e com os marcadores",
    (_name, item) => {
      expect(() => new IdeaType({ ...item, userId: USER_ID }).validate()).not.toThrow();
      expect(item.prompt.split("\n").length).toBeGreaterThan(1);
      for (const marker of ["{{name}}", "{{description}}", "{{objective}}", "{{resources}}"]) {
        expect(item.prompt).toContain(marker);
      }
    },
  );
});
