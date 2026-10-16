import { oauthStartUrl } from '../../services/auth';
import type { Role } from '../../types';
import { ProviderIcon } from './ProviderIcon';

/**
 * "o continuá con" Google / GitHub. Son navegaciones completas (no fetch): la API redirige al proveedor
 * y vuelve a /auth/callback. `role` define el rol de la cuenta si es nueva.
 */
export function SocialLogin({ role }: { role: Extract<Role, 'EMPLOYEE' | 'EMPLOYER'> }) {
  return (
    <>
      <div className="auth__divider" role="separator">
        <span>o continuá con</span>
      </div>
      <div className="social-login">
        <a className="social-login__button" href={oauthStartUrl('google', role)}>
          <ProviderIcon provider="google" />
          Google
        </a>
        <a className="social-login__button" href={oauthStartUrl('github', role)}>
          <ProviderIcon provider="github" />
          GitHub
        </a>
      </div>
    </>
  );
}
