import { useAuth } from '../../hooks/useAuth';
import { Mascot } from '../mascot/Mascot';
import type { AuthTheme } from './AuthLayout';

interface Props {
  theme: AuthTheme;
  title: string;
  description: string;
}

/**
 * Destino provisorio tras el login, hasta migrar las pantallas de cada rol.
 * Al cerrar sesión, RequireRole redirige al login de la sección.
 */
export function RoleHomePlaceholder({ theme, title, description }: Props) {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className={`auth auth--${theme}`}>
      <main className="home-placeholder">
        {/* Saludo tras el login: solo visual, respeta la preferencia del usuario. */}
        <Mascot state="waving" enabled={user.mascotEnabled} />
        <h1 className="home-placeholder__title">{title}</h1>
        <p className="home-placeholder__text">{description}</p>
        <p className="home-placeholder__user">
          Sesión iniciada como <strong>{user.email}</strong>
        </p>
        <button type="button" className="auth__cta home-placeholder__logout" onClick={logout}>
          Cerrar sesión
        </button>
      </main>
    </div>
  );
}
