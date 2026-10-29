import { DomainError, ValidationException } from "@ideias/shared";
import { Idea, IdeaType, SaveIdea } from "../../../src";
import { FakeIdeaRepository, FakeIdeaTypeRepository } from "../../mock";

const OWNER_ID = "7c9e6679-7425-4f40-944b-e07fc1f90ae7";
const OTHER_ID = "0b8f7a1e-3c52-4d6a-9f21-5a1e8c7d4b90";

function makeType(userId = OWNER_ID): IdeaType {
  return new IdeaType({
    name: "Roteiro viral",
    description: "Transforma uma ideia em roteiro curto.",
    prompt: "Crie um roteiro viral sobre {{name}}: {{description}}.",
    userId,
  });
}

const OWN_TYPE = makeType();
const OTHER_TYPE = makeType(OTHER_ID);

const VALID_INPUT = {
  name: "App de receitas",
  description: "Aplicativo que sugere receitas com o que ha na geladeira.",
  objective: "Reduzir o desperdicio de comida em casa.",
  ideaTypeId: OWN_TYPE.id,
  userId: OWNER_ID,
};

function makeExisting(userId = OWNER_ID): Idea {
  return new Idea({ ...VALID_INPUT, name: "Nome antigo", userId });
}

function setup(initial: Idea[] = []) {
  const repository = new FakeIdeaRepository(initial);
  const typeRepository = new FakeIdeaTypeRepository([OWN_TYPE, OTHER_TYPE]);
  const useCase = new SaveIdea(repository, typeRepository);

  return { repository, useCase };
}

async function getErrors(promise: Promise<unknown>): Promise<string[]> {
  try {
    await promise;
    return [];
  } catch (error) {
    return (error as ValidationException).errors.map((item) => item.message);
  }
}

describe("SaveIdea", () => {
  test("deve criar uma ideia para o usuario quando nao ha id", async () => {
    const { repository, useCase } = setup();

    await expect(useCase.execute(VALID_INPUT)).resolves.toBeUndefined();

    expect(repository.ideas).toHaveLength(1);
    expect(repository.ideas[0].name).toBe("App de receitas");
    expect(repository.ideas[0].userId).toBe(OWNER_ID);
    expect(repository.ideas[0].ideaTypeId).toBe(OWN_TYPE.id);
  });

  test("deve criar com o id informado quando o registro nao existe", async () => {
    const { repository, useCase } = setup();
    const id = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";

    await useCase.execute({ ...VALID_INPUT, id });

    expect(repository.ideas.map((item) => item.id)).toEqual([id]);
  });

  test("deve atualizar a ideia existente do mesmo usuario", async () => {
    const existing = makeExisting();
    const { repository, useCase } = setup([existing]);

    await useCase.execute({ ...VALID_INPUT, id: existing.id, name: "Nome novo" });

    expect(repository.ideas).toHaveLength(1);
    expect(repository.ideas[0].id).toBe(existing.id);
    expect(repository.ideas[0].name).toBe("Nome novo");
  });

  test("deve rejeitar atualizacao de ideia de outro usuario com 403", async () => {
    const existing = makeExisting(OTHER_ID);
    const { repository, useCase } = setup([existing]);

    const promise = useCase.execute({ ...VALID_INPUT, id: existing.id });

    await expect(promise).rejects.toThrow(DomainError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 403,
      message: "idea.forbidden",
    });
    expect(repository.ideas[0].name).toBe("Nome antigo");
  });

  test.each(["name", "description", "objective", "ideaTypeId"] as const)(
    "deve exigir %s sem efeitos colaterais",
    async (field) => {
      const { repository, useCase } = setup();

      const errors = await getErrors(
        useCase.execute({ ...VALID_INPUT, [field]: "" }),
      );

      expect(errors).toContain(`idea.${field}.required`);
      expect(repository.ideas).toEqual([]);
    },
  );

  test("deve rejeitar tipo de ideia inexistente com 422", async () => {
    const { repository, useCase } = setup();

    const promise = useCase.execute({
      ...VALID_INPUT,
      ideaTypeId: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    });

    await expect(promise).rejects.toMatchObject({
      statusCode: 422,
      message: "idea.ideaType.invalid",
    });
    expect(repository.ideas).toEqual([]);
  });

  test("deve rejeitar tipo de ideia de outro usuario com 422", async () => {
    const { repository, useCase } = setup();

    const promise = useCase.execute({
      ...VALID_INPUT,
      ideaTypeId: OTHER_TYPE.id,
    });

    await expect(promise).rejects.toMatchObject({
      statusCode: 422,
      message: "idea.ideaType.invalid",
    });
    expect(repository.ideas).toEqual([]);
  });

  describe("recursos", () => {
    const R0 = { type: "text", content: "Primeiro", position: 0 };
    const R1 = { type: "text", content: "Segundo", position: 1 };

    test("deve criar sem recursos quando o campo e omitido", async () => {
      const { repository, useCase } = setup();

      await useCase.execute(VALID_INPUT);

      expect(repository.ideas[0].resources).toEqual([]);
    });

    test("deve criar com 1 recurso gerando o id", async () => {
      const { repository, useCase } = setup();

      await useCase.execute({ ...VALID_INPUT, resources: [{ ...R0, id: "" }] });

      expect(repository.ideas[0].resources).toHaveLength(1);
      expect(repository.ideas[0].resources[0].id).toBeTruthy();
      expect(repository.ideas[0].resources[0].content).toBe("Primeiro");
    });

    test("deve criar com N recursos preservando o id informado", async () => {
      const { repository, useCase } = setup();
      const id = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";

      await useCase.execute({
        ...VALID_INPUT,
        resources: [{ ...R0, id }, R1],
      });

      const resources = repository.ideas[0].resources;
      expect(resources.map((item) => item.content)).toEqual(["Primeiro", "Segundo"]);
      expect(resources[0].id).toBe(id);
    });

    test("deve substituir os recursos no update (replace-all)", async () => {
      const { repository, useCase } = setup();
      await useCase.execute({
        ...VALID_INPUT,
        resources: [R0, R1],
      });
      const idea = repository.ideas[0];
      const kept = idea.resources[0];

      await useCase.execute({
        ...VALID_INPUT,
        id: idea.id,
        resources: [
          { id: kept.id, type: "text", content: "Alterado", position: 0 },
          { type: "text", content: "Novo", position: 1 },
        ],
      });

      const resources = repository.ideas[0].resources;
      expect(resources.map((item) => item.content)).toEqual(["Alterado", "Novo"]);
      expect(resources[0].id).toBe(kept.id);
    });

    test("deve remover todos os recursos quando o campo e omitido no update", async () => {
      const { repository, useCase } = setup();
      await useCase.execute({ ...VALID_INPUT, resources: [R0] });
      const idea = repository.ideas[0];

      await useCase.execute({ ...VALID_INPUT, id: idea.id });

      expect(repository.ideas[0].resources).toEqual([]);
    });

    test("deve rejeitar tipo nao suportado sem efeitos colaterais", async () => {
      const { repository, useCase } = setup();

      const errors = await getErrors(
        useCase.execute({
          ...VALID_INPUT,
          resources: [{ ...R0, type: "image" }],
        }),
      );

      expect(errors).toEqual(["idea.resource.type.unsupported"]);
      expect(repository.ideas).toEqual([]);
    });

    test("deve rejeitar tipo ausente com required", async () => {
      const { repository, useCase } = setup();

      const errors = await getErrors(
        useCase.execute({
          ...VALID_INPUT,
          resources: [{ content: "Sem tipo", position: 0 }],
        }),
      );

      expect(errors).toEqual(["idea.resource.type.required"]);
      expect(repository.ideas).toEqual([]);
    });

    test("deve rejeitar conteudo vazio e mais de 20 recursos", async () => {
      const { repository, useCase } = setup();

      expect(
        await getErrors(
          useCase.execute({ ...VALID_INPUT, resources: [{ ...R0, content: "" }] }),
        ),
      ).toEqual(["idea.resource.content.required"]);
      expect(
        await getErrors(
          useCase.execute({
            ...VALID_INPUT,
            resources: Array.from({ length: 21 }, (_, position) => ({
              ...R0,
              position,
            })),
          }),
        ),
      ).toEqual(["idea.resources.too_many"]);
      expect(repository.ideas).toEqual([]);
    });

    test("deve manter 403 para ideia de outro usuario com recursos", async () => {
      const existing = makeExisting(OTHER_ID);
      const { repository, useCase } = setup([existing]);

      await expect(
        useCase.execute({ ...VALID_INPUT, id: existing.id, resources: [R0] }),
      ).rejects.toMatchObject({ statusCode: 403, message: "idea.forbidden" });
      expect(repository.ideas[0].resources).toEqual([]);
    });

    test("deve manter 422 para tipo de ideia inexistente com recursos", async () => {
      const { repository, useCase } = setup();

      await expect(
        useCase.execute({
          ...VALID_INPUT,
          ideaTypeId: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
          resources: [R0],
        }),
      ).rejects.toMatchObject({ statusCode: 422, message: "idea.ideaType.invalid" });
      expect(repository.ideas).toEqual([]);
    });
  });
});
