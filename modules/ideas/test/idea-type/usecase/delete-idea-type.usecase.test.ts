import { DomainError } from "@ideias/shared";
import { DeleteIdeaType, IdeaType } from "../../../src";
import { FakeIdeaTypeRepository } from "../../mock";

const OWNER_ID = "7c9e6679-7425-4f40-944b-e07fc1f90ae7";
const OTHER_ID = "0b8f7a1e-3c52-4d6a-9f21-5a1e8c7d4b90";

function makeIdeaType(userId = OWNER_ID): IdeaType {
  return new IdeaType({
    name: "Roteiro viral",
    description: "Transforma uma ideia em roteiro curto.",
    prompt: "Crie um roteiro viral sobre {{name}}: {{description}}.",
    userId,
  });
}

function setup(initial: IdeaType[] = []) {
  const repository = new FakeIdeaTypeRepository(initial);
  const useCase = new DeleteIdeaType(repository);

  return { repository, useCase };
}

describe("DeleteIdeaType", () => {
  test("deve excluir o tipo do proprio usuario", async () => {
    const ideaType = makeIdeaType();
    const { repository, useCase } = setup([ideaType]);

    await expect(
      useCase.execute({ id: ideaType.id, userId: OWNER_ID }),
    ).resolves.toBeUndefined();

    expect(repository.ideaTypes).toEqual([]);
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
      message: "idea-type.not_found",
    });
  });

  test("deve responder 403 e manter o registro de outro usuario", async () => {
    const ideaType = makeIdeaType(OTHER_ID);
    const { repository, useCase } = setup([ideaType]);

    const promise = useCase.execute({ id: ideaType.id, userId: OWNER_ID });

    await expect(promise).rejects.toMatchObject({
      statusCode: 403,
      message: "idea-type.forbidden",
    });
    expect(repository.ideaTypes).toHaveLength(1);
  });
});
