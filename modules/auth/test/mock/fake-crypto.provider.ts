import { CryptoProvider } from "../../src";

export class FakeCryptoProvider implements CryptoProvider {
  readonly encryptedPasswords: string[] = [];

  async encrypt(password: string): Promise<string> {
    this.encryptedPasswords.push(password);
    return `$2b$10$${"a".repeat(53)}`;
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return hashedPassword === `$2b$10$${"a".repeat(53)}` && password.length > 0;
  }
}
