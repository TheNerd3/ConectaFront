const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
const TOKEN_KEY = 'token';

/** Se emite cuando la API rechaza el token guardado (vencido, usuario suspendido, etc.). */
export const UNAUTHORIZED_EVENT = 'auth:unauthorized';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(0, 'No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo.');
  }

  if (!res.ok) {
    if (res.status === 401 && token) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    throw new ApiError(res.status, await errorMessage(res));
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

async function errorMessage(res: Response): Promise<string> {
  if (res.status === 429) return 'Demasiados intentos. Esperá un minuto y volvé a probar.';
  const body = await res.json().catch(() => null);
  // class-validator devuelve un array de mensajes.
  const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
  return typeof message === 'string' && message ? message : 'Ocurrió un error inesperado. Intentá de nuevo.';
}
