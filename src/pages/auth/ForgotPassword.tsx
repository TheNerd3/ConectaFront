import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { BRAND, sideFromParam } from '../../components/auth/brandContent';
import { FormAlert } from '../../components/auth/FormAlert';
import { TextField } from '../../components/auth/TextField';
import { validateEmail } from '../../components/auth/validation';
import { ROLE_LOGIN } from '../../routes/roles';
import { ApiError } from '../../services/api';
import { authService } from '../../services/auth';

/** "¿Olvidaste tu contraseña?" de empleado y empleador (el admin la cambia con el seed). */
export default function ForgotPassword() {
  const [params] = useSearchParams();
  const side = sideFromParam(params.get('perfil'));
  const loginPath = side === 'employer' ? ROLE_LOGIN.EMPLOYER : ROLE_LOGIN.EMPLOYEE;

  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState<string>();
  const [formError, setFormError] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const error = validateEmail(email);
    setFieldError(error);
    setFormError(null);
    if (error) return;

    setSubmitting(true);
    try {
      setSentMessage((await authService.forgotPassword(email.trim())).message);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Ocurrió un error inesperado. Intentá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout theme={side} brand={BRAND[side]}>
      <h2 className="auth__heading">Recuperá tu contraseña</h2>
      <p className="auth__subheading">Te enviamos un link para elegir una nueva.</p>

      {sentMessage ? (
        <>
          <div className="form-notice" role="status">
            {sentMessage} Revisá también la carpeta de spam. El link vence en 30 minutos.
          </div>
          <Link className="auth__cta auth__cta--link" to={loginPath}>
            Volver a iniciar sesión
          </Link>
        </>
      ) : (
        <form className="auth__form" onSubmit={handleSubmit} noValidate>
          <FormAlert>{formError}</FormAlert>
          <TextField
            label="Email"
            type="email"
            placeholder={side === 'employer' ? 'tu@empresa.com' : 'tu@email.com'}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldError}
          />
          <button type="submit" className="auth__cta" disabled={submitting} aria-busy={submitting}>
            {submitting ? 'Enviando…' : 'Enviar link'}
          </button>
        </form>
      )}

      <p className="auth__footer">
        ¿Te acordaste? <Link to={loginPath}>Iniciá sesión</Link>
      </p>
    </AuthLayout>
  );
}
