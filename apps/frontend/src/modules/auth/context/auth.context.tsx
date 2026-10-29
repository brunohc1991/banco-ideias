'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import Cookies from 'js-cookie';
import { decodeJwtPayload } from '../util/jwt.util';

const AUTH_COOKIE = 'auth_token';
const COOKIE_EXPIRES_DAYS = 7;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  status: AuthStatus;
}

interface AuthContextValue extends AuthState {
  login: (token: string) => void;
  logout: () => void;
}

const UNAUTHENTICATED: AuthState = { user: null, token: null, status: 'unauthenticated' };

const AuthContext = createContext<AuthContextValue | null>(null);

function stateFromToken(token: string | undefined): AuthState {
  if (!token) return UNAUTHENTICATED;

  const payload = decodeJwtPayload(token);
  if (!payload) return UNAUTHENTICATED;

  return {
    user: { id: payload.sub, name: payload.name, email: payload.email },
    token,
    status: 'authenticated',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, token: null, status: 'loading' });

  useEffect(() => {
    setState(stateFromToken(Cookies.get(AUTH_COOKIE)));
  }, []);

  const login = useCallback((token: string) => {
    Cookies.set(AUTH_COOKIE, token, {
      expires: COOKIE_EXPIRES_DAYS,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    setState(stateFromToken(token));
  }, []);

  const logout = useCallback(() => {
    Cookies.remove(AUTH_COOKIE);
    setState(UNAUTHENTICATED);
  }, []);

  const value = useMemo(() => ({ ...state, login, logout }), [state, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  }

  return context;
}
