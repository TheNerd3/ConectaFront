import { RoleLoginPage } from '../../components/auth/RoleLoginPage';

/** Login / registro de empleador (docs/prototype/MainEmpleador.dc.html). */
export default function EmployerLogin({ mode }: { mode: 'login' | 'register' }) {
  return <RoleLoginPage side="employer" mode={mode} />;
}
