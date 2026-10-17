import type { ReactNode } from 'react';
import { Icon, type IconName } from '../ui/Icon';

export type AuthTheme = 'employee' | 'employer' | 'admin';

export interface BrandContent {
  badge: string;
  headline: string;
  subtext: string;
  bullets: { icon: IconName; text: string }[];
}

interface Props {
  theme: AuthTheme;
  brand: BrandContent;
  children: ReactNode;
}

// Marco común de los logins del prototipo: panel de marca a la izquierda y formulario a la derecha.
// Los colores salen de la clase auth--<theme> (tokens de src/styles/tokens.css).
export function AuthLayout({ theme, brand, children }: Props) {
  return (
    <div className={`auth auth--${theme}`}>
      <div className="auth__frame">
        <aside className="auth__brand">
          <div className="auth__logo">
            <span className="auth__logo-mark">
              <Icon name="check" size={16} strokeWidth={3} />
            </span>
            <span className="auth__logo-text">Conecta</span>
          </div>

          <div className="auth__pitch">
            <span className="auth__badge">{brand.badge}</span>
            <h1 className="auth__headline">{brand.headline}</h1>
            <p className="auth__subtext">{brand.subtext}</p>
            <ul className="auth__bullets">
              {brand.bullets.map((b) => (
                <li key={b.text}>
                  <Icon name={b.icon} className="auth__bullet-icon" />
                  <span>{b.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="auth__copyright">© 2026 Conecta</p>
        </aside>

        <main className="auth__panel">
          <div className="auth__form-wrap">{children}</div>
        </main>
      </div>
    </div>
  );
}
