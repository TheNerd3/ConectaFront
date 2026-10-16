import { RoleLoginPage } from '../../components/auth/RoleLoginPage';

/** Login / onboarding de empleado (docs/prototype/Main.dc.html). */
export default function EmployeeLogin({ mode }: { mode: 'login' | 'register' }) {
  return <RoleLoginPage side="employee" mode={mode} />;
}
