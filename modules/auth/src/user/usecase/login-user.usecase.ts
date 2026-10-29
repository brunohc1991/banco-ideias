import {
  EmailRule,
  RequiredRule,
  UnauthorizedError,
  UseCase,
  Validator,
} from "@ideias/shared";
import { CryptoProvider, UserRepository } from "../provider";

export interface LoginUserIn {
  email: string;
  password: string;
}

export interface LoginUserOut {
  id: string;
  name: string;
  email: string;
}

export class LoginUser implements UseCase<LoginUserIn, LoginUserOut> {
  constructor(
    private readonly cryptoProvider: CryptoProvider,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: LoginUserIn): Promise<LoginUserOut> {
    Validator.validate([
      {
        code: "user.email",
        value: input.email,
        rules: [new RequiredRule(), new EmailRule()],
      },
      {
        code: "user.password",
        value: input.password,
        rules: [new RequiredRule()],
      },
    ]);

    const user = await this.userRepository.findByEmail(input.email);
    const passwordMatches = user
      ? await this.cryptoProvider.compare(input.password, user.password)
      : false;

    if (!user || !passwordMatches) {
      throw new UnauthorizedError("user.credentials.invalid");
    }

    return { id: user.id, name: user.name, email: user.email };
  }
}
