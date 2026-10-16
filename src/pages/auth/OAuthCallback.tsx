import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { BRAND, sideFromParam } from '../../components/auth/brandContent';
import { FormAlert } from '../../components/auth/FormAlert';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_HOME, ROLE_LOGIN } from '../../routes/roles';
import { ApiError } from '../../services/api';

const ERROR_MESSAGES: Record<string, string> = {
  provider_not_configured: 'El inicio de sesión con este proveedor todavía no está disponible.',
  cancelled: 'Cancelaste el inicio de sesión.',
  state: 'El inicio de sesión venció o no es válido. Volvé a intentarlo.',
  provider: 'No pudimos comunicarnos con el proveedor. Volvé a intentarlo.',
  email_not_verified:
    'Tu cuenta del proveedor no tiene un email verificado. Verificalo o registrate con email y contraseña.',
  not_allowed: 'No es posible ingresar con esta cuenta por este medio.',
};
const GENERIC_ERROR = 'No pudimos iniciar sesión. Volvé a intentarlo.';

/**
 * Vuelta del login con Google/GitHub. La API deja en el fragmento (#) un código de un solo uso,
 * un token de registro pendiente (empleador nuevo) o un error.
 */
export default function OAuthCallback() {
  const { loginWithOAuthCode } = useAuth();
  const navigate = useNavigate();
  // Se lee el fragmento una sola vez: el efecto lo borra de la URL.
  const [params] = useState(() => new URLSearchParams(window.location.hash.slice(1)));
  const code = params.get('code');
  const signup = params.get('signup');
  const errorCode = params.get('error');
  const side = sideFromParam(params.get('perfil'));

  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const error =
    exchangeError ?? (code || signup ? null : (errorCode && ERROR_MESSAGES[errorCode]) || GENERIC_ERROR);
  const handled = useRef(false);

  useEffect(() => {
    // El código es de un solo uso: evitar el doble efecto de StrictMode.
    if (handled.current) return;
    handled.current = true;

    if (signup) {
      navigate('/empleador/completar-registro', { replace: true, state: { signupToken: signup } });
      return;
    }
    // Se borra el fragmento para que el código no quede en el historial.
    navigate(window.location.pathname, { replace: true });
    if (code) {
      loginWithOAuthCode(code)
        .then((user) => navigate(ROLE_HOME[user.role], { replace: true }))
        .catch((e) => setExchangeError(e instanceof ApiError ? e.message : GENERIC_ERROR));
    }
  }, [code, signup, loginWithOAuthCode, navigate]);

  if (!error) {
    return (
      <p className="route-loading" role="status">
        Ingresando…
      </p>
    );
  }

  return (
    <AuthLayout theme={side} brand={BRAND[side]}>
      <h2 className="auth__heading">No pudimos iniciar sesión</h2>
      <p className="auth__subheading">Podés volver a intentarlo o entrar con tu email y contraseña.</p>
      <FormAlert>{error}</FormAlert>
      <Link className="auth__cta auth__cta--link" to={side === 'employer' ? ROLE_LOGIN.EMPLOYER : ROLE_LOGIN.EMPLOYEE}>
        Volver a iniciar sesión
      </Link>
    </AuthLayout>
  );
}
