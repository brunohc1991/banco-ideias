import {
  ConflictError,
  RequiredRule,
  StrongPasswordRule,
  UseCase,
  ValidationError,
  ValidationException,
  Validator,
} from "@ideias/shared";
import { User } from "../model";
import { CryptoProvider, UserRepository } from "../provider";

export interface RegisterUserIn {
  name: string;
  email: string;
  password: string;
}

export class RegisterUser implements UseCase<RegisterUserIn, void> {
  constructor(
    private readonly cryptoProvider: CryptoProvider,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: RegisterUserIn): Promise<void> {
    const draft = new User(input);

    this.validateInput(draft);

    const existingUser = await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new ConflictError("user.email.already.exists");
    }

    const hashedPassword = await this.cryptoProvider.encrypt(input.password);
    const user = draft.clone({ password: hashedPassword });

    user.validate();

    await this.userRepository.create(user);
  }

  // A senha em texto puro nao e um hash, entao so name e email vem da entidade;
  // a senha e validada pela regra de senha forte para reportar todos os erros juntos.
  private validateInput(draft: User): void {
    const errors = [
      ...this.collectErrors(() => draft.validate()).filter(
        (error) => !error.message.startsWith("user.password."),
      ),
      ...this.collectErrors(() =>
        Validator.validate([
          {
            code: "user.password",
            value: draft.password,
            rules: [new RequiredRule(), new StrongPasswordRule()],
          },
        ]),
      ),
    ];

    if (errors.length > 0) {
      throw new ValidationException(errors);
    }
  }

  private collectErrors(validate: () => void): ValidationError[] {
    try {
      validate();
      return [];
    } catch (error) {
      if (error instanceof ValidationException) {
        return error.errors;
      }
      throw error;
    }
  }
}
