// Los 13 estados de la mascota (ERS, sección Mascota). Es puramente visual: no influye en ninguna decisión.
export const MASCOT_STATES = [
  'likes-cv', // 1  CV bien evaluado
  'dislikes-cv', // 2  CV con problemas
  'analyzing-a', // 3  analizando (pose A)
  'analyzing-b', // 4  analizando (pose B, alterna con A)
  'missing-data', // 5  faltan datos
  'perfect', // 6  puntaje 100
  'hired', // 7  consiguió el trabajo
  'no-matches', // 8  sin coincidencias
  'waving', // 9  saludo después del login
  'interview-set', // 10 entrevista agendada
  'writing-letter', // 11 verificando idiomas / escribiendo carta de presentación
  'match-high', // 12 match >= 60%
  'match-low', // 13 match <= 59%
] as const;

export type MascotState = (typeof MASCOT_STATES)[number];
