export type Role = 'EMPLOYEE' | 'EMPLOYER' | 'ADMIN';
export type Stage = 'REVIEW' | 'INTERVIEW' | 'HIRED' | 'REJECTED';

export interface AuthUser {
  id: number;
  email: string;
  role: Role;
  mascotEnabled: boolean;
}
