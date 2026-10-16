import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { tokenStorage, UNAUTHORIZED_EVENT } from '../services/api';
import { authService } from '../services/auth';
import type { AuthUser } from '../types';
import { AuthContext, type AuthContextValue, type AuthStatus } from './authContext';

// Guarda el token, carga el usuario con /auth/me y expone login/registro/logout.
// El token vive en localStorage y nunca se loguea. Mejora pendiente: cookie httpOnly + refresh token.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() => (tokenStorage.get() ? 'loading' : 'anonymous'));

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    setStatus('anonymous');
  }, []);

  const startSession = useCallback(async (accessToken: string) => {
    tokenStorage.set(accessToken);
    try {
      const me = await authService.me();
      setUser(me);
      setStatus('authenticated');
      return me;
    } catch (e) {
      tokenStorage.clear();
      throw e;
    }
  }, []);

  // Al abrir la app con un token guardado, se valida contra la API.
  useEffect(() => {
    if (!tokenStorage.get()) return;
    let cancelled = false;
    authService
      .me()
      .then((me) => {
        if (cancelled) return;
        setUser(me);
        setStatus('authenticated');
      })
      .catch(() => {
        if (!cancelled) logout();
      });
    return () => {
      cancelled = true;
    };
  }, [logout]);

  // Si la API rechaza el token (vencido, usuario suspendido), se cierra la sesión.
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout);
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      logout,
      login: async (email, password) => {
        const res = await authService.login(email, password);
        if (res.requires2fa && res.challengeToken) return { requires2fa: true, challengeToken: res.challengeToken };
        if (!res.accessToken) throw new Error('Respuesta de login inesperada');
        return { user: await startSession(res.accessToken) };
      },
      verify2fa: async (challengeToken, code) =>
        startSession((await authService.verify2fa(challengeToken, code)).accessToken),
      registerEmployee: async (data) => startSession((await authService.registerEmployee(data)).accessToken),
      registerEmployer: async (data) => startSession((await authService.registerEmployer(data)).accessToken),
    }),
    [user, status, logout, startSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
