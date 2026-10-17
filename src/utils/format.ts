import type { Modality, SalaryRange } from '../types/vacancy';

export const MODALITY_LABEL: Record<Modality, string> = {
  REMOTE: 'Remoto',
  HYBRID: 'Híbrido',
  ONSITE: 'Presencial',
};

const money = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

/** "AR$ 1.400.000 – 1.800.000", "Desde AR$ 2.200.000", o null si no hay rango visible. */
export function formatSalary(salary: Pick<SalaryRange, 'min' | 'max'> | null): string | null {
  if (!salary || (salary.min === null && salary.max === null)) return null;
  if (salary.min !== null && salary.max !== null) {
    return `AR$ ${money.format(salary.min)} – ${money.format(salary.max)}`;
  }
  return salary.min !== null ? `Desde AR$ ${money.format(salary.min)}` : `Hasta AR$ ${money.format(salary.max!)}`;
}

const relative = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

/** "hoy", "ayer", "hace 3 días", "hace 2 semanas"… */
export function timeAgo(iso: string, now = Date.now()): string {
  const days = Math.floor((now - new Date(iso).getTime()) / 86_400_000);
  if (days < 7) return relative.format(-days, 'day');
  if (days < 30) return relative.format(-Math.floor(days / 7), 'week');
  if (days < 365) return relative.format(-Math.floor(days / 30), 'month');
  return relative.format(-Math.floor(days / 365), 'year');
}

/** Iniciales para el "logo" de la empresa: "Bluecore Labs" → "BL". */
export function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
}

// Colores de logo del prototipo; se elige uno estable por empresa.
const LOGO_COLORS = ['#1C5FA8', '#1D7A4C', '#B3760A', '#726C60', '#D97757', '#0F2E29'];

export function logoColor(seed: string | number): string {
  const text = String(seed);
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return LOGO_COLORS[hash % LOGO_COLORS.length];
}

export type ResponseSpeed = 'fast' | 'slow' | 'none';

/** Clasificación del tiempo de respuesta de la empresa (sin datos → 'none', nunca inventado). */
export function responseSpeed(avgResponseHours: number | null): ResponseSpeed {
  if (avgResponseHours === null) return 'none';
  return avgResponseHours <= 72 ? 'fast' : 'slow';
}

export const RESPONSE_LABEL: Record<ResponseSpeed, string> = {
  fast: 'Responde rápido',
  slow: 'Respuesta lenta',
  none: 'Sin datos de respuesta',
};

export function formatResponseTime(hours: number): string {
  const days = Math.round(hours / 24);
  return days < 1 ? 'menos de 1 día' : `${days} ${days === 1 ? 'día' : 'días'}`;
}
