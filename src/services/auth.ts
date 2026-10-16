import type { AccessTokenResponse, AuthUser, LoginResponse, Role } from '../types';
import { api, API_URL } from './api';

const post = <T>(path: string, body: unknown) => api<T>(path, { method: 'POST', body: JSON.stringify(body) });

export const authService = {
  login: (email: string, password: string) => post<LoginResponse>('/auth/login', { email, password }),

  verify2fa: (challengeToken: string, code: string) =>
    post<AccessTokenResponse>('/auth/login/2fa', { challengeToken, code }),

  registerEmployee: (data: { email: string; password: string; fullName: string }) =>
    post<AccessTokenResponse>('/auth/register/employee', data),

  registerEmployer: (data: { email: string; password: string; companyName: string }) =>
    post<AccessTokenResponse>('/auth/register/employer', data),

  me: () => api<AuthUser>('/auth/me'),

  forgotPassword: (email: string) => post<{ message: string }>('/auth/password/forgot', { email }),

  resetPassword: (token: string, password: string) =>
    post<AccessTokenResponse>('/auth/password/reset', { token, password }),

  exchangeOAuthCode: (code: string) => post<AccessTokenResponse>('/auth/oauth/exchange', { code }),

  completeEmployerSignup: (signupToken: string, companyName: string) =>
    post<AccessTokenResponse>('/auth/oauth/complete-employer', { signupToken, companyName }),
};

/** URL para iniciar el login con Google/GitHub (navegación completa del navegador). */
export function oauthStartUrl(provider: 'google' | 'github', role: Extract<Role, 'EMPLOYEE' | 'EMPLOYER'>): string {
  return `${API_URL}/auth/oauth/${provider}?role=${role}`;
}
