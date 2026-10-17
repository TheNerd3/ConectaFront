const HINT = 'El porcentaje de match se va a calcular cuando cargues tu CV. Es solo informativo: nunca oculta ofertas.';

/**
 * Lugar reservado para el porcentaje de match. Todavía no hay CV ni cálculo,
 * así que se muestra "—": nunca un número inventado.
 */
export function MatchSlot({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  return (
    <div className={`match-slot match-slot--${size}`} title={HINT}>
      <span className="match-slot__value" aria-hidden="true">
        —
      </span>
      <span className="match-slot__label">{size === 'lg' ? 'de match con tu perfil' : 'match'}</span>
      <span className="visually-hidden">Match no disponible todavía. {HINT}</span>
    </div>
  );
}
