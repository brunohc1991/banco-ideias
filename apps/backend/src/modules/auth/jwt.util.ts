import * as jwt from 'jsonwebtoken';

export interface TokenUser {
  id: string;
  name: string;
  email: string;
}

const DEFAULT_EXPIRES_IN = '7d';

export function signUserToken(
  user: TokenUser,
  secret: string,
  expiresIn: string = DEFAULT_EXPIRES_IN,
): string {
  return jwt.sign(
    { sub: user.id, name: user.name, email: user.email },
    secret,
    { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] },
  );
}
