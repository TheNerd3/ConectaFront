/** Insignia de empresa verificada (del prototipo). */
export function VerifiedBadge({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#1C5FA8" stroke="#fff" strokeWidth="1.5" role="img">
      <title>Empresa verificada</title>
      <path d="M12 2l2.4 1.9 3-.5 1 2.9 2.7 1.4-.9 3 1.7 2.5-2.4 2 .1 3-3 .4-1.6 2.5-2.9-.9-2.9.9-1.6-2.5-3-.4.1-3-2.4-2 1.7-2.5-.9-3 2.7-1.4 1-2.9 3 .5z" />
      <path d="M9 12l2 2 4-4" stroke="#fff" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
