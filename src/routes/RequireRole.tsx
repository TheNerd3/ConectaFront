import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { Role } from '../types';
import { ROLE_HOME, ROLE_LOGIN } from './roles';

/**
 * Protege una sección por rol. Es solo UX: la seguridad real la aplica la API.
 * Sin sesión → login de esa sección. Con otro rol → inicio de su propia sección.
 */
export function RequireRole({ role }: { role: Role }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <p className="route-loading" role="status">
        Cargando…
      </p>
    );
  }
  if (!user) return <Navigate to={ROLE_LOGIN[role]} replace state={{ from: location.pathname }} />;
  if (user.role !== role) return <Navigate to={ROLE_HOME[user.role]} replace />;
  return <Outlet />;
}
