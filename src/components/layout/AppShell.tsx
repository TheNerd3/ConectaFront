import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { initials } from '../../utils/format';
import { Icon, type IconName } from '../ui/Icon';

export interface NavItem {
  label: string;
  icon: IconName;
  /** Sin `to`: pantalla todavía no migrada, se muestra deshabilitada. */
  to?: string;
  /** Rutas extra que también marcan el ítem como activo (ej.: el detalle dentro de la búsqueda). */
  activeFor?: string[];
}

interface Props {
  theme: 'employee' | 'employer';
  items: NavItem[];
}

/** Marco de la app (prototipo): riel de íconos a la izquierda y panel blanco con el contenido. */
export function AppShell({ theme, items }: Props) {
  const { user, logout } = useAuth();
  const path = useLocation().pathname;

  return (
    <div className={`shell shell--${theme}`}>
      <div className="shell__frame">
        <nav className="rail" aria-label="Navegación principal">
          <span className="rail__logo" aria-hidden="true">
            <Icon name="check" size={16} strokeWidth={3} />
          </span>

          {items.map((item) =>
            item.to ? (
              <NavLink
                key={item.label}
                to={item.to}
                title={item.label}
                aria-label={item.label}
                className={({ isActive }) =>
                  `rail__item${isActive || item.activeFor?.some((p) => path.startsWith(p)) ? ' rail__item--active' : ''}`
                }
              >
                <Icon name={item.icon} />
              </NavLink>
            ) : (
              <span
                key={item.label}
                className="rail__item rail__item--disabled"
                title={`${item.label} (próximamente)`}
                aria-label={`${item.label} (próximamente)`}
                aria-disabled="true"
                role="link"
              >
                <Icon name={item.icon} />
              </span>
            ),
          )}

          <div className="rail__bottom">
            <button type="button" className="rail__item" onClick={logout} title="Cerrar sesión" aria-label="Cerrar sesión">
              <Icon name="logout" />
            </button>
            <span className="rail__avatar" title={user?.email} aria-hidden="true">
              {user ? initials(user.email.split('@')[0].replace(/[._-]+/g, ' ')) : ''}
            </span>
          </div>
        </nav>

        <main className="shell__panel">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
