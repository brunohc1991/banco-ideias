import {
  ConflictError,
  ValidationException,
} from "@ideias/shared";
import { RegisterUser, User } from "../../../src";
import { FakeCryptoProvider, FakeUserRepository } from "../../mock";

const VALID_INPUT = {
  name: "Joao Silva",
  email: "joao@silva.com",
  password: "Strong@123",
};

function setup(initialUsers: User[] = []) {
  const cryptoProvider = new FakeCryptoProvider();
  const userRepository = new FakeUserRepository(initialUsers);
  const useCase = new RegisterUser(cryptoProvider, userRepository);

  return { cryptoProvider, userRepository, useCase };
}

async function getErrors(promise: Promise<void>): Promise<string[]> {
  try {
    await promise;
    return [];
  } catch (error) {
    return (error as ValidationException).errors.map((item) => item.message);
  }
}

describe("RegisterUser", () => {
  test("deve criptografar a senha e persistir o usuario no caminho feliz", async () => {
    const { cryptoProvider, userRepository, useCase } = setup();

    await expect(useCase.execute(VALID_INPUT)).resolves.toBeUndefined();

    expect(cryptoProvider.encryptedPasswords).toEqual(["Strong@123"]);
    expect(userRepository.users).toHaveLength(1);
    expect(userRepository.users[0].email).toBe("joao@silva.com");
    expect(userRepository.users[0].password).not.toBe("Strong@123");
  });

  test("deve rejeitar senha fraca sem efeitos colaterais", async () => {
    const { cryptoProvider, userRepository, useCase } = setup();

    const errors = await getErrors(
      useCase.execute({ ...VALID_INPUT, password: "123456" }),
    );

    expect(errors).toEqual(["user.password.strong.password"]);
    expect(cryptoProvider.encryptedPasswords).toEqual([]);
    expect(userRepository.users).toEqual([]);
  });

  test("deve exigir a senha quando ela nao for informada", async () => {
    const { userRepository, useCase } = setup();

    const errors = await getErrors(
      useCase.execute({ ...VALID_INPUT, password: undefined as never }),
    );

    expect(errors).toEqual(["user.password.required"]);
    expect(userRepository.users).toEqual([]);
  });

  test("deve reportar todos os campos invalidos juntos", async () => {
    const { userRepository, useCase } = setup();

    const errors = await getErrors(
      useCase.execute({ name: "A", email: "invalido", password: "123" }),
    );

    expect(errors.some((e) => e.startsWith("user.name."))).toBe(true);
    expect(errors).toContain("user.email.invalid.email");
    expect(errors).toContain("user.password.strong.password");
    expect(userRepository.users).toEqual([]);
  });

  test("deve rejeitar email ja cadastrado com ConflictError", async () => {
    const existing = new User({
      ...VALID_INPUT,
      password: `$2b$10$${"a".repeat(53)}`,
    });
    const { cryptoProvider, userRepository, useCase } = setup([existing]);

    const promise = useCase.execute(VALID_INPUT);

    await expect(promise).rejects.toThrow(ConflictError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 409,
      message: "user.email.already.exists",
    });
    expect(cryptoProvider.encryptedPasswords).toEqual([]);
    expect(userRepository.users).toHaveLength(1);
  });

  test("deve propagar erros inesperados da validacao", async () => {
    const { useCase } = setup();
    const spy = jest.spyOn(User.prototype, "validate").mockImplementation(() => {
      throw new Error("boom");
    });

    await expect(useCase.execute(VALID_INPUT)).rejects.toThrow("boom");

    spy.mockRestore();
  });
});
