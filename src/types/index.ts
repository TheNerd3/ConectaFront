export type Role = 'EMPLOYEE' | 'EMPLOYER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';
export type Stage = 'REVIEW' | 'INTERVIEW' | 'HIRED' | 'REJECTED';

/** Respuesta de GET /auth/me. */
export interface AuthUser {
  id: number;
  email: string;
  role: Role;
  status: UserStatus;
  mascotEnabled: boolean;
}

/** Respuesta de POST /auth/login: access token, o (ADMIN) el token intermedio del 2FA. */
export interface LoginResponse {
  accessToken?: string;
  requires2fa?: boolean;
  challengeToken?: string;
}

export interface AccessTokenResponse {
  accessToken: string;
}
