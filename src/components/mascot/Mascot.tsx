import { AnimatePresence, motion } from 'framer-motion';
import type { MascotState } from './mascotStates';

interface Props {
  state: MascotState;
  size?: number;
  /** Si el usuario desactivó la mascota en Configuración, no se renderiza nada. */
  enabled?: boolean;
}

// Las imágenes van en /public/mascot/<estado>.png (PNG o WebP con fondo transparente).
export function Mascot({ state, size = 160, enabled = true }: Props) {
  if (!enabled) return null;
  return (
    <AnimatePresence mode="wait">
      <motion.img
        key={state}
        src={`/mascot/${state}.png`}
        alt=""
        aria-hidden
        width={size}
        height={size}
        initial={{ opacity: 0, y: 8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
      />
    </AnimatePresence>
  );
}
