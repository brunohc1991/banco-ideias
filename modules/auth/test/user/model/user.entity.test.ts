import { ValidationException } from "@ideias/shared";
import { User, UserState } from "../../../src/user/model/user.entity";

const VALID_HASH = `$2b$10$${"a".repeat(53)}`;

function makeState(overrides: Partial<UserState> = {}): UserState {
  return {
    name: "Maria Silva",
    email: "maria@example.com",
    password: VALID_HASH,
    ...overrides,
  };
}

function getValidationMessages(callback: () => void): string[] {
  try {
    callback();
    return [];
  } catch (error) {
    return (error as ValidationException).errors.map((item) => item.message);
  }
}

describe("User", () => {
  it("cria uma entidade valida e expoe os getters", () => {
    const user = new User(makeState());

    expect(user.name).toBe("Maria Silva");
    expect(user.email).toBe("maria@example.com");
    expect(user.password).toBe(VALID_HASH);
    expect(user.id).toBeDefined();
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
    expect(user.deletedAt).toBeNull();
  });

  it("e lazy: permite existir invalida antes do validate()", () => {
    const user = new User(makeState({ name: "", email: "x", password: "y" }));

    expect(user.name).toBe("");
    expect(() => user.validate()).toThrow(ValidationException);
  });

  it("valida com sucesso dados validos", () => {
    expect(() => new User(makeState()).validate()).not.toThrow();
  });

  it("clone preserva id e createdAt e atualiza updatedAt", () => {
    const user = new User(
      makeState({ updatedAt: new Date("2020-01-01T00:00:00Z") }),
    );
    const cloned = user.clone({ name: "Joana Souza" });

    expect(cloned.id).toBe(user.id);
    expect(cloned.createdAt).toEqual(user.createdAt);
    expect(cloned.name).toBe("Joana Souza");
    expect(cloned.updatedAt.getTime()).toBeGreaterThan(
      user.updatedAt.getTime(),
    );
    expect(user.equals(cloned)).toBe(true);
  });

  describe("name", () => {
    it.each([
      ["vazio", ""],
      ["curto demais", "Al"],
      ["longo demais", `Maria ${"a".repeat(80)}`],
      ["sem sobrenome", "Maria"],
      ["com numeros", "Maria 123"],
    ])("rejeita nome %s", (_label, name) => {
      const messages = getValidationMessages(() =>
        new User(makeState({ name })).validate(),
      );

      expect(messages.length).toBeGreaterThan(0);
      expect(messages.every((m) => m.startsWith("user.name."))).toBe(true);
    });

    it("aceita nome com 3 caracteres e composto", () => {
      expect(() =>
        new User(makeState({ name: "Jo A" })).validate(),
      ).not.toThrow();
    });
  });

  describe("email", () => {
    it("rejeita email vazio", () => {
      const messages = getValidationMessages(() =>
        new User(makeState({ email: "" })).validate(),
      );

      expect(messages.some((m) => m.startsWith("user.email."))).toBe(true);
    });

    it("rejeita email invalido", () => {
      const messages = getValidationMessages(() =>
        new User(makeState({ email: "maria@" })).validate(),
      );

      expect(messages).toEqual(["user.email.invalid.email"]);
    });
  });

  describe("password", () => {
    it("rejeita senha que nao e hash bcrypt", () => {
      const messages = getValidationMessages(() =>
        new User(makeState({ password: "Abcdef1!" })).validate(),
      );

      expect(messages.length).toBe(1);
      expect(messages[0].startsWith("user.password.")).toBe(true);
    });
  });

  it("acumula erros de varios campos", () => {
    const messages = getValidationMessages(() =>
      new User(makeState({ name: "A", email: "x", password: "y" })).validate(),
    );

    expect(messages.some((m) => m.startsWith("user.name."))).toBe(true);
    expect(messages.some((m) => m.startsWith("user.email."))).toBe(true);
    expect(messages.some((m) => m.startsWith("user.password."))).toBe(true);
  });
});
