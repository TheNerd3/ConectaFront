import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { BRAND } from '../../components/auth/brandContent';
import { FormAlert } from '../../components/auth/FormAlert';
import { PasswordField } from '../../components/auth/PasswordField';
import { hasErrors, validatePassword, type FieldErrors } from '../../components/auth/validation';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_HOME } from '../../routes/roles';
import { ApiError } from '../../services/api';

/** Token del fragmento (#token=…): no viaja a ningún servidor. */
const readTokenFromHash = () => new URLSearchParams(window.location.hash.slice(1)).get('token');

/** Destino del link del email de recuperación. */
export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [token] = useState(readTokenFromHash);

  // Se saca el token de la URL para que no quede en el historial.
  useEffect(() => {
    if (window.location.hash) navigate(window.location.pathname, { replace: true });
  }, [navigate]);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<FieldErrors<'password' | 'confirm'>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = {
      password: validatePassword(password, 'register'),
      confirm: password !== confirm ? 'Las contraseñas no coinciden' : undefined,
    };
    setErrors(nextErrors);
    setFormError(null);
    if (hasErrors(nextErrors) || !token) return;

    setSubmitting(true);
    try {
      const user = await resetPassword(token, password);
      navigate(ROLE_HOME[user.role], { replace: true });
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Ocurrió un error inesperado. Intentá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout theme="employee" brand={BRAND.employee}>
      <h2 className="auth__heading">Elegí una contraseña nueva</h2>
      <p className="auth__subheading">Al guardarla se cierran las sesiones abiertas en otros dispositivos.</p>

      {token ? (
        <form className="auth__form" onSubmit={handleSubmit} noValidate>
          <FormAlert>{formError}</FormAlert>
          <PasswordField
            label="Contraseña nueva"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            maxLength={128}
          />
          <PasswordField
            label="Repetí la contraseña"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={errors.confirm}
            maxLength={128}
          />
          <button type="submit" className="auth__cta" disabled={submitting} aria-busy={submitting}>
            {submitting ? 'Guardando…' : 'Guardar e ingresar'}
          </button>
        </form>
      ) : (
        <FormAlert>El link para restablecer la contraseña es inválido o está incompleto.</FormAlert>
      )}

      <p className="auth__footer">
        ¿El link venció? <Link to="/recuperar-contrasena">Pedí uno nuevo</Link>
      </p>
    </AuthLayout>
  );
}
