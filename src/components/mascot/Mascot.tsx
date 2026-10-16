import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import type { MascotState } from './mascotStates';

interface Props {
  state: MascotState;
  size?: number;
  /** Si el usuario desactivó la mascota en Configuración, no se renderiza nada. */
  enabled?: boolean;
}

// Las imágenes van en /public/mascot/<estado>.png (PNG o WebP con fondo transparente).
// Si la imagen de un estado no existe (o falla al cargar), la mascota simplemente no se muestra.
export function Mascot({ state, size = 160, enabled = true }: Props) {
  const [failedState, setFailedState] = useState<MascotState | null>(null);
  if (!enabled || failedState === state) return null;
  return (
    <AnimatePresence mode="wait">
      <motion.img
        key={state}
        src={`/mascot/${state}.png`}
        alt=""
        aria-hidden
        width={size}
        height={size}
        onError={() => setFailedState(state)}
        initial={{ opacity: 0, y: 8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
      />
    </AnimatePresence>
  );
}
