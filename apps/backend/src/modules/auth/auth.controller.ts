import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  LoginUser,
  RegisterUser,
  type LoginUserIn,
  type LoginUserOut,
  type RegisterUserIn,
} from '@ideias/auth';
import { Public } from '../../shared/decorators';
import { BcryptCryptoProvider } from './bcrypt.crypto';
import { signUserToken } from './jwt.util';
import { PrismaUserRepository } from './user.prisma';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userRepository: PrismaUserRepository,
    private readonly cryptoProvider: BcryptCryptoProvider,
    private readonly configService: ConfigService,
  ) {}

  @Get('/')
  getAuth() {
    return { message: 'Auth endpoint' };
  }

  @Public()
  @Post('/register')
  async register(@Body() body: RegisterUserIn): Promise<void> {
    const useCase = new RegisterUser(this.cryptoProvider, this.userRepository);

    await useCase.execute(body ?? ({} as RegisterUserIn));
  }

  @Public()
  @Post('/login')
  @HttpCode(200)
  async login(
    @Body() body: LoginUserIn,
  ): Promise<{ token: string; user: LoginUserOut }> {
    const useCase = new LoginUser(this.cryptoProvider, this.userRepository);

    const user = await useCase.execute(body ?? ({} as LoginUserIn));
    const token = signUserToken(
      user,
      this.configService.getOrThrow<string>('JWT_SECRET'),
      this.configService.get<string>('JWT_EXPIRES_IN'),
    );

    return { token, user };
  }
}
