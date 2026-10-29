import { DeleteProcessing } from "../../../src";
import { FakeProcessingRepository } from "../../mock";
import { OTHER_ID, OWNER_ID, makeProcessing } from "../factory";

describe("DeleteProcessing", () => {
  test("exclui o processamento do dono", async () => {
    const processing = makeProcessing();
    const repository = new FakeProcessingRepository([processing]);

    await expect(
      new DeleteProcessing(repository).execute({ id: processing.id, userId: OWNER_ID }),
    ).resolves.toBeUndefined();
    expect(repository.processings).toEqual([]);
  });

  test("responde 404 para inexistente e alheio", async () => {
    const processing = makeProcessing();
    const repository = new FakeProcessingRepository([processing]);
    const useCase = new DeleteProcessing(repository);

    await expect(useCase.execute({ id: "x", userId: OWNER_ID })).rejects.toMatchObject({
      statusCode: 404,
      message: "processing.not_found",
    });
    await expect(useCase.execute({ id: processing.id, userId: OTHER_ID })).rejects.toMatchObject({
      statusCode: 404,
      message: "processing.not_found",
    });
    expect(repository.processings).toHaveLength(1);
  });
});
