import { AppShell, type NavItem } from '../components/layout/AppShell';

// Menús del prototipo. Los ítems sin `to` son pantallas que todavía no se migraron.

const EMPLOYEE_NAV: NavItem[] = [
  { label: 'Buscar empleo', icon: 'search', to: '/empleado/buscar', activeFor: ['/empleado/vacantes'] },
  { label: 'Mis postulaciones', icon: 'applications' },
  { label: 'Calendario', icon: 'calendar' },
  { label: 'Analizador de CV', icon: 'cvCheck' },
  { label: 'Mi perfil', icon: 'user' },
  { label: 'Mensajes', icon: 'message' },
  { label: 'Configuración', icon: 'settings' },
];

const EMPLOYER_NAV: NavItem[] = [
  { label: 'Mis vacantes', icon: 'building', to: '/empleador/vacantes', activeFor: ['/empleador/vacantes/'] },
  { label: 'Publicar vacante', icon: 'plus', to: '/empleador/publicar' },
  { label: 'Mensajes', icon: 'message' },
  { label: 'Perfil de empresa', icon: 'briefcase' },
  { label: 'Configuración', icon: 'settings' },
];

export function EmployeeShell() {
  return <AppShell theme="employee" items={EMPLOYEE_NAV} />;
}

export function EmployerShell() {
  return <AppShell theme="employer" items={EMPLOYER_NAV} />;
}
