import { createContext } from 'react';
import type { AuthUser } from '../types';

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

/** Resultado del primer paso del login: sesión iniciada, o (ADMIN) falta el código 2FA. */
export type LoginResult = { user: AuthUser } | { requires2fa: true; challengeToken: string };

export interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<LoginResult>;
  verify2fa: (challengeToken: string, code: string) => Promise<AuthUser>;
  registerEmployee: (data: { email: string; password: string; fullName: string }) => Promise<AuthUser>;
  registerEmployer: (data: { email: string; password: string; companyName: string }) => Promise<AuthUser>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
