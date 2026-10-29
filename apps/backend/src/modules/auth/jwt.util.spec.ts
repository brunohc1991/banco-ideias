import * as jwt from 'jsonwebtoken';
import { signUserToken } from './jwt.util';

describe('signUserToken', () => {
  const user = { id: 'u1', name: 'José da Conceição', email: 'jose@x.com' };

  it('assina o payload mínimo com sub, name e email', () => {
    const payload = jwt.verify(signUserToken(user, 'secret'), 'secret') as jwt.JwtPayload;

    expect(payload.sub).toBe('u1');
    expect(payload.name).toBe('José da Conceição');
    expect(payload.email).toBe('jose@x.com');
    expect(payload).not.toHaveProperty('password');
  });

  it('expira em 7 dias por padrão', () => {
    const payload = jwt.decode(signUserToken(user, 'secret')) as jwt.JwtPayload;

    expect(payload.exp! - payload.iat!).toBe(7 * 24 * 60 * 60);
  });

  it('respeita a expiração informada', () => {
    const payload = jwt.decode(signUserToken(user, 'secret', '1h')) as jwt.JwtPayload;

    expect(payload.exp! - payload.iat!).toBe(3600);
  });
});
