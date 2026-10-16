import { Route, Routes } from 'react-router-dom';
import Landing from '../pages/Landing';

// Rutas por rol (se completan al migrar cada pantalla del prototipo):
//   /empleado/*  → buscar, detalle, dashboard, analizador de CV, perfil, chat, notificaciones
//   /empleador/* → vacantes, pipeline, publicar, perfil de empresa, configuración
//   /admin/*     → resumen, empresas y ofertas, usuarios
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
    </Routes>
  );
}
