# Conecta · Frontend (ConectaFront)

## Regla #1: autoría
- El único autor de este proyecto es Sol. **Nunca** agregar a Claude como autor ni colaborador: sin `Co-Authored-By`, sin `Claude-Session`, sin "Generated with Claude Code" ni firmas en commits, PRs, código, README o docs.
- Los commits van con la identidad git de Sol (`git config user.name` / `user.email`); no cambiarla.

## Qué es
Interfaz de una plataforma de búsqueda laboral con tres roles (empleado, empleador, admin). Proyecto personal de portfolio. Diferenciador: **sin filtrado por IA** y **estado de postulación siempre visible**.
Backend: repo ConectaBack (NestJS, API en `/api`, Swagger en `/docs`).

## Stack
React 19 + TypeScript (strict) + Vite · React Router · Framer Motion · cliente HTTP en `src/services/api.ts`.

## Comandos
- `npm run dev` · `npm run build` (debe pasar antes de cada commit) · `npm run lint`

## Diseño (ya hay prototipo aprobado)
- Tres identidades visuales, tokens en `src/styles/tokens.css`:
  empleado = verde #0F2E29 + terracota #D97757; empleador = invertido (terracota dominante); admin = carbón #2B2A28 + ámbar #C9A227.
- Las pantallas se migran una por una desde el prototipo, ya conectadas a la API. Mantener fielmente el diseño.
- Pantallas: empleado (login/onboarding, buscar, detalle, dashboard, analizador de CV, perfil, chat, notificaciones); empleador (login, vacantes, pipeline, publicar, perfil empresa, configuración); admin (login con 2FA, resumen, empresas y ofertas, usuarios).

## Mascota
- Componente `<Mascot state="..."/>` con 13 estados (`src/components/mascot/mascotStates.ts`), imágenes en `public/mascot/<estado>.png` con fondo transparente.
- Es **solo visual**: no influye en ninguna decisión ni dato mostrado. Respetar `user.mascotEnabled`.
- Aparece en momentos clave: saludo tras login, análisis de CV, match (≥60% / ≤59%), entrevista agendada, contratado, sin resultados, etc.

## Reglas (INNEGOCIABLES)
1. Mostrar siempre el estado real de la postulación al empleado; nunca ocultarlo ni simularlo.
2. No mostrar notas internas al empleado, ni datos sensibles del candidato antes de la etapa de entrevista (el backend ya filtra: no reimplementar la lógica en el front, solo reflejarla).
3. Nada de textos ni UX que sugieran descarte automático por IA.
4. El control de acceso por rol en el front es solo UX; la seguridad real vive en la API.
5. Token JWT: tratarlo con cuidado; no loguearlo.

## Convenciones
- Componentes funcionales con hooks, un componente por archivo, `PascalCase.tsx`.
- Páginas en `src/pages/<rol>/`, rutas por rol en `src/routes/`.
- Todo llamado a la API pasa por `src/services/`; tipos compartidos en `src/types/`.
- Estados de carga, error y vacío en cada pantalla con datos.
- Accesibilidad básica: labels, foco visible, contraste, `alt` en imágenes informativas.
- Responsive: probar a ~400px de ancho.
- Commits chicos y en español, estilo `feat(login): ...`.

## Cómo trabajar
- Responder y comentar en español; código e identificadores en inglés.
- Antes de un cambio grande, proponer el plan en pocas líneas y esperar OK.
- Cambios mínimos y enfocados; no refactorizar código no relacionado.
- No instalar dependencias nuevas sin avisar por qué.
- Nunca commitear `.env`.
