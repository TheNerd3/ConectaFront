import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { BRAND } from '../../components/auth/brandContent';
import { FormAlert } from '../../components/auth/FormAlert';
import { SocialLogin } from '../../components/auth/SocialLogin';
import { TextField } from '../../components/auth/TextField';
import { validateName } from '../../components/auth/validation';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_HOME, ROLE_LOGIN } from '../../routes/roles';
import { ApiError } from '../../services/api';

/** Email del token de registro, solo para mostrarlo (la API es la que lo verifica). */
function emailFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.email === 'string' ? payload.email : null;
  } catch {
    return null;
  }
}

/** Paso extra del registro de empleador con Google/GitHub: falta el nombre de la empresa. */
export default function EmployerCompleteSignup() {
  const { completeEmployerSignup } = useAuth();
  const navigate = useNavigate();
  const signupToken = (useLocation().state as { signupToken?: string } | null)?.signupToken;

  const [companyName, setCompanyName] = useState('');
  const [fieldError, setFieldError] = useState<string>();
  const [formError, setFormError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!signupToken) return <Navigate to={ROLE_LOGIN.EMPLOYER} replace />;
  const email = emailFromToken(signupToken);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const error = validateName(companyName, 'Ingresá el nombre de la empresa');
    setFieldError(error);
    setFormError(null);
    if (error) return;

    setSubmitting(true);
    try {
      const user = await completeEmployerSignup(signupToken!, companyName.trim());
      navigate(ROLE_HOME[user.role], { replace: true });
    } catch (err) {
      setExpired(err instanceof ApiError && err.status === 401);
      setFormError(err instanceof ApiError ? err.message : 'Ocurrió un error inesperado. Intentá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout theme="employer" brand={BRAND.employer}>
      <h2 className="auth__heading">Un paso más</h2>
      <p className="auth__subheading">
        {email ? (
          <>
            Vas a crear la cuenta de empresa con <strong>{email}</strong>. ¿Cómo se llama tu empresa?
          </>
        ) : (
          '¿Cómo se llama tu empresa?'
        )}
      </p>

      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        <FormAlert>{formError}</FormAlert>
        {expired ? (
          <SocialLogin role="EMPLOYER" />
        ) : (
          <>
            <TextField
              label="Nombre de la empresa"
              placeholder="Acme S.A."
              autoComplete="organization"
              maxLength={120}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              error={fieldError}
            />
            <button type="submit" className="auth__cta" disabled={submitting} aria-busy={submitting}>
              {submitting ? 'Creando cuenta…' : 'Crear cuenta de empresa'}
            </button>
          </>
        )}
      </form>

      <p className="auth__footer">
        ¿Tu empresa ya tiene cuenta? <Link to={ROLE_LOGIN.EMPLOYER}>Iniciá sesión</Link>
      </p>
    </AuthLayout>
  );
}
