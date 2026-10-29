import { UnauthorizedError, ValidationException } from "@ideias/shared";
import { LoginUser, User } from "../../../src";
import { FakeCryptoProvider, FakeUserRepository } from "../../mock";

const HASH = `$2b$10$${"a".repeat(53)}`;

const EXISTING_USER = new User({
  name: "Joao Silva",
  email: "joao@silva.com",
  password: HASH,
});

function setup() {
  const useCase = new LoginUser(
    new FakeCryptoProvider(),
    new FakeUserRepository([EXISTING_USER]),
  );

  return { useCase };
}

async function getErrors(promise: Promise<unknown>): Promise<string[]> {
  try {
    await promise;
    return [];
  } catch (error) {
    return (error as ValidationException).errors.map((item) => item.message);
  }
}

describe("LoginUser", () => {
  test("deve devolver apenas id, name e email com credenciais validas", async () => {
    const { useCase } = setup();

    const output = await useCase.execute({
      email: "joao@silva.com",
      password: "Strong@123",
    });

    expect(output).toEqual({
      id: EXISTING_USER.id,
      name: "Joao Silva",
      email: "joao@silva.com",
    });
    expect(output).not.toHaveProperty("password");
  });

  test("deve rejeitar email inexistente com credenciais invalidas", async () => {
    const { useCase } = setup();

    const promise = useCase.execute({
      email: "outro@silva.com",
      password: "Strong@123",
    });

    await expect(promise).rejects.toThrow(UnauthorizedError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 401,
      message: "user.credentials.invalid",
    });
  });

  test("deve rejeitar senha incorreta com a mesma mensagem", async () => {
    const { useCase } = setup();
    const wrongHashUser = new User({
      name: "Maria Souza",
      email: "maria@souza.com",
      password: `$2b$10$${"b".repeat(53)}`,
    });
    const useCaseWithWrongHash = new LoginUser(
      new FakeCryptoProvider(),
      new FakeUserRepository([wrongHashUser]),
    );

    const promise = useCaseWithWrongHash.execute({
      email: "maria@souza.com",
      password: "Strong@123",
    });

    await expect(promise).rejects.toMatchObject({
      statusCode: 401,
      message: "user.credentials.invalid",
    });
    expect(useCase).toBeDefined();
  });

  test("deve exigir o email quando ele estiver vazio", async () => {
    const { useCase } = setup();

    const errors = await getErrors(
      useCase.execute({ email: "", password: "Strong@123" }),
    );

    expect(errors).toContain("user.email.required");
  });

  test("deve rejeitar email com formato invalido", async () => {
    const { useCase } = setup();

    const errors = await getErrors(
      useCase.execute({ email: "invalido", password: "Strong@123" }),
    );

    expect(errors).toEqual(["user.email.invalid.email"]);
  });

  test("deve exigir a senha quando ela estiver vazia", async () => {
    const { useCase } = setup();

    const errors = await getErrors(
      useCase.execute({ email: "joao@silva.com", password: "" }),
    );

    expect(errors).toEqual(["user.password.required"]);
  });
});
