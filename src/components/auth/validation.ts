// Validaciones de formularios de auth. La validación real la hace la API; esto es para dar feedback rápido.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | undefined {
  if (!value.trim()) return 'Ingresá tu email';
  if (!EMAIL_RE.test(value.trim())) return 'Ingresá un email válido';
}

/** En el login solo se exige que no esté vacía; en el registro, el mínimo que pide la API. */
export function validatePassword(value: string, mode: 'login' | 'register'): string | undefined {
  if (!value) return 'Ingresá tu contraseña';
  if (mode === 'register' && value.length < 8) return 'Usá al menos 8 caracteres';
  if (value.length > 128) return 'La contraseña es demasiado larga';
}

export function validateName(value: string, emptyMessage: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length < 2) return emptyMessage;
  if (trimmed.length > 120) return 'Máximo 120 caracteres';
}

export function validateTotp(value: string): string | undefined {
  const digits = value.replace(/\s/g, '');
  if (!digits) return 'Ingresá el código de tu app de autenticación';
  if (!/^\d{6}$/.test(digits)) return 'El código tiene 6 dígitos';
}

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}
