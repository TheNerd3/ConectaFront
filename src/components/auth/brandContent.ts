import type { BrandContent } from './AuthLayout';

// Panel de marca de los logins (docs/prototype/Main.dc.html y MainEmpleador.dc.html).

export type Side = 'employee' | 'employer';

export const BRAND: Record<Side, BrandContent> = {
  employee: {
    badge: 'Sin filtros de IA',
    headline: 'Buscá trabajo sin que un algoritmo te descarte primero.',
    subtext: 'Cada postulación la revisa una persona. Y vos ves en todo momento en qué estado está cada una.',
    bullets: [
      { icon: 'checkCircle', text: 'Seguimiento claro del estado de cada postulación' },
      { icon: 'checkCircle', text: 'Match por habilidades reales, no por palabras exactas' },
      { icon: 'checkCircle', text: 'Un solo perfil, postulate con un clic' },
    ],
  },
  employer: {
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
};

/** `perfil` en la URL (?perfil=empleador / #perfil=empleador) → lado. */
export function sideFromParam(value: string | null): Side {
  return value === 'empleador' ? 'employer' : 'employee';
}

export const SIDE_PARAM: Record<Side, string> = { employee: 'empleado', employer: 'empleador' };
