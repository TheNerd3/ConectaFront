import type { AccessTokenResponse, AuthUser, LoginResponse } from '../types';
import { api } from './api';

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
};
