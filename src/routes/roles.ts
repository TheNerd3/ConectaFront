import type { Role } from '../types';

/** Sección (prefijo de rutas) de cada rol. */
export const ROLE_HOME: Record<Role, string> = {
  EMPLOYEE: '/empleado',
  EMPLOYER: '/empleador',
  ADMIN: '/admin',
};

export const ROLE_LOGIN: Record<Role, string> = {
  EMPLOYEE: '/empleado/login',
  EMPLOYER: '/empleador/login',
  ADMIN: '/admin/login',
};

/** Destino tras el login: la ruta que se quiso abrir si es de su sección; si no, el inicio de su rol. */
export function homeAfterLogin(role: Role, from?: string): string {
  const home = ROLE_HOME[role];
  return from && (from === home || from.startsWith(`${home}/`)) ? from : home;
}
