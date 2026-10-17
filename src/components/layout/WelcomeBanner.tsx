import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Mascot } from '../mascot/Mascot';
import { Icon } from '../ui/Icon';

/** Saludo tras el login (la ruta llega con state.welcome). La mascota es solo visual y respeta mascotEnabled. */
export function WelcomeBanner({ message }: { message: string }) {
  const { user } = useAuth();
  const welcome = (useLocation().state as { welcome?: boolean } | null)?.welcome;
  const [dismissed, setDismissed] = useState(false);
  if (!welcome || dismissed || !user) return null;

  return (
    <div className="welcome" role="status">
      <Mascot state="waving" size={64} enabled={user.mascotEnabled} />
      <p className="welcome__text">{message}</p>
      <button type="button" className="welcome__close" onClick={() => setDismissed(true)} aria-label="Cerrar saludo">
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}
