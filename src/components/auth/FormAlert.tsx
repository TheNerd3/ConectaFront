import type { ReactNode } from 'react';

/** Mensaje de error general del formulario (anunciado por lectores de pantalla). */
export function FormAlert({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <div className="form-alert" role="alert">
      {children}
    </div>
  );
}
