# Conecta · Frontend

Interfaz web de **Conecta**, una plataforma de búsqueda laboral con tres roles (empleado, empleador y administrador) y dos principios de diseño:

- **Sin filtrado automático por IA**: ningún candidato se descarta solo; solo una persona mueve una postulación de etapa.
- **Transparencia total**: el empleado ve siempre en qué estado está su postulación.

Backend: [ConectaBack](https://github.com/TheNerd3/ConectaBack) (NestJS + PostgreSQL + Prisma).

## Stack

React 19 · TypeScript · Vite · React Router · Framer Motion (mascota animada)

## Primeros pasos

```bash
npm install
cp .env.example .env     # apunta VITE_API_URL a la API
npm run dev              # http://localhost:5173
```

| Script            | Qué hace                    |
| ----------------- | --------------------------- |
| `npm run dev`     | Servidor de desarrollo      |
| `npm run build`   | Chequeo de tipos + build    |
| `npm run lint`    | Lint con oxlint             |
| `npm run preview` | Sirve el build localmente   |

## Estructura

```
src/
├── components/mascot/   # <Mascot state="..."/> y los 13 estados
├── pages/
│   ├── employee/        # buscar, detalle, dashboard, analizador de CV, perfil, chat, notificaciones
│   ├── employer/        # vacantes, pipeline, publicar, perfil de empresa, configuración
│   └── admin/           # resumen, empresas y ofertas, usuarios
├── routes/              # rutas por rol
├── services/            # cliente HTTP hacia la API
├── hooks/  types/  styles/
public/mascot/           # imágenes de la mascota (PNG/WebP con fondo transparente)
```

## Identidad visual por rol

| Rol       | Color principal | Acento  |
| --------- | --------------- | ------- |
| Empleado  | `#0F2E29`       | `#D97757` |
| Empleador | `#D97757`       | `#0F2E29` |
| Admin     | `#2B2A28`       | `#C9A227` |

Los tokens están en `src/styles/tokens.css`.

## Mascota

Es puramente visual (no influye en ninguna decisión) y el usuario puede desactivarla (`mascotEnabled`). Tiene 13 estados, definidos en `src/components/mascot/mascotStates.ts`:

`likes-cv`, `dislikes-cv`, `analyzing-a`, `analyzing-b`, `missing-data`, `perfect`, `hired`, `no-matches`, `waving`, `interview-set`, `writing-letter`, `match-high` (≥ 60 %), `match-low` (≤ 59 %).

Cada estado espera un archivo `public/mascot/<estado>.png` con **fondo transparente**.

## Hoja de ruta

1. Login real contra la API (JWT) y rutas protegidas por rol.
2. Migrar las pantallas del prototipo una por una, conectadas a la API.
3. Animaciones de la mascota en los momentos clave.
4. Deploy (Vercel/Netlify) y CI con GitHub Actions.
