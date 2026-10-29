import { DomainError, ValidationException } from "@ideias/shared";
import { IdeaType, SaveIdeaType } from "../../../src";
import { FakeIdeaTypeRepository } from "../../mock";

const OWNER_ID = "7c9e6679-7425-4f40-944b-e07fc1f90ae7";
const OTHER_ID = "0b8f7a1e-3c52-4d6a-9f21-5a1e8c7d4b90";

const VALID_INPUT = {
  name: "Roteiro viral",
  description: "Transforma uma ideia em roteiro curto.",
  prompt: "Crie um roteiro viral sobre {{name}}: {{description}}.",
  userId: OWNER_ID,
};

function makeExisting(userId = OWNER_ID): IdeaType {
  return new IdeaType({ ...VALID_INPUT, name: "Nome antigo", userId });
}

function setup(initial: IdeaType[] = []) {
  const repository = new FakeIdeaTypeRepository(initial);
  const useCase = new SaveIdeaType(repository);

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

describe("SaveIdeaType", () => {
  test("deve criar um tipo para o usuario quando nao ha id", async () => {
    const { repository, useCase } = setup();

    await expect(useCase.execute(VALID_INPUT)).resolves.toBeUndefined();

    expect(repository.ideaTypes).toHaveLength(1);
    expect(repository.ideaTypes[0].name).toBe("Roteiro viral");
    expect(repository.ideaTypes[0].userId).toBe(OWNER_ID);
  });

  test("deve criar com o id informado quando o registro nao existe", async () => {
    const { repository, useCase } = setup();
    const id = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";

    await useCase.execute({ ...VALID_INPUT, id });

    expect(repository.ideaTypes.map((item) => item.id)).toEqual([id]);
  });

  test("deve atualizar o tipo existente do mesmo usuario", async () => {
    const existing = makeExisting();
    const { repository, useCase } = setup([existing]);

    await useCase.execute({
      ...VALID_INPUT,
      id: existing.id,
      name: "Nome novo",
    });

    expect(repository.ideaTypes).toHaveLength(1);
    expect(repository.ideaTypes[0].id).toBe(existing.id);
    expect(repository.ideaTypes[0].name).toBe("Nome novo");
  });

  test("deve rejeitar atualizacao de tipo de outro usuario com 403", async () => {
    const existing = makeExisting(OTHER_ID);
    const { repository, useCase } = setup([existing]);

    const promise = useCase.execute({ ...VALID_INPUT, id: existing.id });

    await expect(promise).rejects.toThrow(DomainError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 403,
      message: "idea-type.forbidden",
    });
    expect(repository.ideaTypes[0].name).toBe("Nome antigo");
  });

  test("deve exigir os campos obrigatorios sem efeitos colaterais", async () => {
    const { repository, useCase } = setup();

    const errors = await getErrors(
      useCase.execute({ ...VALID_INPUT, name: "", description: "", prompt: "" }),
    );

    expect(errors).toEqual(
      expect.arrayContaining([
        "idea-type.name.required",
        "idea-type.description.required",
        "idea-type.prompt.required",
      ]),
    );
    expect(repository.ideaTypes).toEqual([]);
  });

  test("deve rejeitar prompt fora do limite", async () => {
    const { repository, useCase } = setup();

    const tooShort = await getErrors(
      useCase.execute({ ...VALID_INPUT, prompt: "curto" }),
    );
    const tooLong = await getErrors(
      useCase.execute({ ...VALID_INPUT, prompt: "a".repeat(8001) }),
    );

    expect(tooShort).toEqual(["idea-type.prompt.min.length"]);
    expect(tooLong).toEqual(["idea-type.prompt.max.length"]);
    expect(repository.ideaTypes).toEqual([]);
  });
});
