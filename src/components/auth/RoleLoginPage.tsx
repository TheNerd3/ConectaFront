import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ApiError } from '../../services/api';
import { homeAfterLogin, ROLE_HOME, ROLE_LOGIN } from '../../routes/roles';
import { AuthLayout, type BrandContent } from './AuthLayout';
import { FormAlert } from './FormAlert';
import { PasswordField } from './PasswordField';
import { TextField } from './TextField';
import { hasErrors, validateEmail, validateName, validatePassword, type FieldErrors } from './validation';

type Side = 'employee' | 'employer';
type Mode = 'login' | 'register';
type Field = 'email' | 'password' | 'name';

interface SideCopy {
  brand: BrandContent;
  login: { heading: string; subheading: string; cta: string; footer: string; footerLink: string };
  register: { heading: string; subheading: string; cta: string; footer: string; footerLink: string };
  emailPlaceholder: string;
  nameLabel: string;
  namePlaceholder: string;
  nameError: string;
}

// Textos del prototipo (docs/prototype/Main.dc.html y MainEmpleador.dc.html).
const COPY: Record<Side, SideCopy> = {
  employee: {
    brand: {
      badge: 'Sin filtros de IA',
      headline: 'Buscá trabajo sin que un algoritmo te descarte primero.',
      subtext: 'Cada postulación la revisa una persona. Y vos ves en todo momento en qué estado está cada una.',
      bullets: [
        { icon: 'checkCircle', text: 'Seguimiento claro del estado de cada postulación' },
        { icon: 'checkCircle', text: 'Match por habilidades reales, no por palabras exactas' },
        { icon: 'checkCircle', text: 'Un solo perfil, postulate con un clic' },
      ],
    },
    login: {
      heading: 'Bienvenido de nuevo',
      subheading: 'Entrá y seguí tus postulaciones.',
      cta: 'Iniciar sesión',
      footer: '¿No tenés cuenta?',
      footerLink: 'Registrate gratis',
    },
    register: {
      heading: 'Creá tu cuenta',
      subheading: 'Armá tu perfil y postulate en minutos.',
      cta: 'Crear cuenta',
      footer: '¿Ya tenés cuenta?',
      footerLink: 'Iniciá sesión',
    },
    emailPlaceholder: 'tu@email.com',
    nameLabel: 'Nombre completo',
    namePlaceholder: 'Ana Pérez',
    nameError: 'Ingresá tu nombre completo',
  },
  employer: {
    brand: {
      badge: 'Para empresas',
      headline: 'Encontrá talento sin perder lo humano en el proceso.',
      subtext: 'Tu equipo revisa cada postulante a mano. Transparencia total con cada candidato, en cada etapa.',
      bullets: [
        { icon: 'checkCircle', text: 'Cada candidato lo revisa una persona de tu equipo, no un filtro automático' },
        { icon: 'checkCircle', text: 'Pipeline claro por etapas: revisión, entrevista, contratado' },
        // El prototipo decía "motivo de rechazo obligatorio"; la regla del producto es que sea opcional.
        { icon: 'checkCircle', text: 'Motivos de rechazo listos para dar feedback real a cada candidato' },
      ],
    },
    login: {
      heading: 'Portal de empresas',
      subheading: 'Entrá y gestioná tus búsquedas.',
      cta: 'Iniciar sesión como empresa',
      footer: '¿Tu empresa no está registrada?',
      footerLink: 'Crear cuenta de empresa',
    },
    register: {
      heading: 'Registrá tu empresa',
      subheading: 'Creá la cuenta y empezá a publicar búsquedas.',
      cta: 'Crear cuenta de empresa',
      footer: '¿Tu empresa ya tiene cuenta?',
      footerLink: 'Iniciá sesión',
    },
    emailPlaceholder: 'tu@empresa.com',
    nameLabel: 'Nombre de la empresa',
    namePlaceholder: 'Acme S.A.',
    nameError: 'Ingresá el nombre de la empresa',
  },
};

const PATHS: Record<Side, Record<Mode, string>> = {
  employee: { login: ROLE_LOGIN.EMPLOYEE, register: '/empleado/registro' },
  employer: { login: ROLE_LOGIN.EMPLOYER, register: '/empleador/registro' },
};

interface Props {
  side: Side;
  mode: Mode;
}

/** Login / registro de empleado y empleador (misma pantalla en el prototipo, con toggle de perfil). */
export function RoleLoginPage({ side, mode }: Props) {
  const { status, user, login, registerEmployee, registerEmployer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isAdminAccount, setIsAdminAccount] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Mientras se envía el form, la redirección la maneja handleSubmit.
  if (status === 'authenticated' && user && !submitting) return <Navigate to={ROLE_HOME[user.role]} replace />;

  const copy = COPY[side];
  const text = copy[mode];
  const isRegister = mode === 'register';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: FieldErrors<Field> = {
      email: validateEmail(email),
      password: validatePassword(password, mode),
      name: isRegister ? validateName(name, copy.nameError) : undefined,
    };
    setErrors(nextErrors);
    setFormError(null);
    setIsAdminAccount(false);
    if (hasErrors(nextErrors)) return;

    setSubmitting(true);
    try {
      const credentials = { email: email.trim(), password };
      if (isRegister) {
        const created =
          side === 'employee'
            ? await registerEmployee({ ...credentials, fullName: name.trim() })
            : await registerEmployer({ ...credentials, companyName: name.trim() });
        navigate(ROLE_HOME[created.role], { replace: true });
        return;
      }

      const result = await login(credentials.email, password);
      if ('requires2fa' in result) {
        setIsAdminAccount(true);
        return;
      }
      navigate(homeAfterLogin(result.user.role, from), { replace: true });
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Ocurrió un error inesperado. Intentá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout theme={side} brand={copy.brand}>
      <nav className="role-toggle" aria-label="Tipo de cuenta">
        <Link
          to={PATHS.employee[mode]}
          className="role-toggle__option"
          aria-current={side === 'employee' ? 'page' : undefined}
        >
          Busco empleo
        </Link>
        <Link
          to={PATHS.employer[mode]}
          className="role-toggle__option"
          aria-current={side === 'employer' ? 'page' : undefined}
        >
          Busco talento
        </Link>
      </nav>

      <h2 className="auth__heading">{text.heading}</h2>
      <p className="auth__subheading">{text.subheading}</p>

      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        <FormAlert>{formError}</FormAlert>
        {isAdminAccount && (
          <FormAlert>
            Esta cuenta ingresa desde el <Link to={ROLE_LOGIN.ADMIN}>acceso de administración</Link>.
          </FormAlert>
        )}

        {isRegister && (
          <TextField
            label={copy.nameLabel}
            placeholder={copy.namePlaceholder}
            autoComplete={side === 'employee' ? 'name' : 'organization'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            maxLength={120}
          />
        )}
        <TextField
          label="Email"
          type="email"
          placeholder={copy.emailPlaceholder}
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <PasswordField
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          maxLength={128}
        />

        <button type="submit" className="auth__cta" disabled={submitting} aria-busy={submitting}>
          {submitting ? (isRegister ? 'Creando cuenta…' : 'Ingresando…') : text.cta}
        </button>
      </form>

      <p className="auth__footer">
        {text.footer} <Link to={PATHS[side][isRegister ? 'login' : 'register']}>{text.footerLink}</Link>
      </p>
    </AuthLayout>
  );
}
