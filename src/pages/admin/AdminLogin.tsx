import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout, type BrandContent } from '../../components/auth/AuthLayout';
import { FormAlert } from '../../components/auth/FormAlert';
import { Icon } from '../../components/ui/Icon';
import { PasswordField } from '../../components/auth/PasswordField';
import { TextField } from '../../components/auth/TextField';
import {
  hasErrors,
  validateEmail,
  validatePassword,
  validateTotp,
  type FieldErrors,
} from '../../components/auth/validation';
import { useAuth } from '../../hooks/useAuth';
import { homeAfterLogin, ROLE_HOME } from '../../routes/roles';
import { ApiError } from '../../services/api';

type Field = 'email' | 'password' | 'code';

// Textos del prototipo (docs/prototype/AdminLogin.dc.html).
const BRAND: BrandContent = {
  badge: 'Acceso restringido',
  headline: 'Panel de administración.',
  subtext:
    'Solo para el equipo que mantiene la plataforma: moderación de empresas y ofertas, estadísticas de uso y gestión de cuentas.',
  bullets: [
    { icon: 'lock', text: 'Acceso con cuenta asignada por el equipo técnico' },
    { icon: 'dashboard', text: 'Métricas y moderación en un solo lugar' },
  ],
};

/**
 * Login de ADMIN con 2FA. El prototipo pide email, contraseña y código en un mismo formulario;
 * por detrás son los dos pasos de la API: POST /auth/login → challengeToken → POST /auth/login/2fa.
 */
export default function AdminLogin() {
  const { status, user, login, verify2fa } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'authenticated' && user && !submitting) return <Navigate to={ROLE_HOME[user.role]} replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: FieldErrors<Field> = {
      email: validateEmail(email),
      password: validatePassword(password, 'login'),
      code: validateTotp(code),
    };
    setErrors(nextErrors);
    setFormError(null);
    if (hasErrors(nextErrors)) return;

    setSubmitting(true);
    try {
      const result = await login(email.trim(), password);
      // Una cuenta que no es ADMIN no pasa por el 2FA: entra directo a su sección.
      const loggedUser =
        'requires2fa' in result ? await verify2fa(result.challengeToken, code.replace(/\s/g, '')) : result.user;
      navigate(homeAfterLogin(loggedUser.role, from), { replace: true });
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Ocurrió un error inesperado. Intentá de nuevo.');
      setCode('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout theme="admin" brand={BRAND}>
      <div className="auth__lock-badge">
        <Icon name="lock" />
      </div>

      <h2 className="auth__heading">Acceso administrador</h2>
      <p className="auth__subheading">Ingresá con tu cuenta de administración.</p>

      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        <FormAlert>{formError}</FormAlert>

        <TextField
          label="Email"
          type="email"
          placeholder="admin@conecta.com"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <PasswordField
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          maxLength={128}
        />
        <TextField
          label="Código de verificación (2FA)"
          placeholder="000 000"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={7}
          className="field__input--code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^\d\s]/g, ''))}
          error={errors.code}
        />

        <button type="submit" className="auth__cta" disabled={submitting} aria-busy={submitting}>
          {submitting ? 'Verificando…' : 'Ingresar al panel'}
        </button>
      </form>

      <p className="auth__footer">¿Problemas para entrar? Contactá al equipo técnico.</p>
    </AuthLayout>
  );
}
