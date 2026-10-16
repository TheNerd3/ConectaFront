import { Navigate, Route, Routes } from 'react-router-dom';
import AdminHome from '../pages/admin/AdminHome';
import AdminLogin from '../pages/admin/AdminLogin';
import ForgotPassword from '../pages/auth/ForgotPassword';
import OAuthCallback from '../pages/auth/OAuthCallback';
import ResetPassword from '../pages/auth/ResetPassword';
import EmployeeHome from '../pages/employee/EmployeeHome';
import EmployeeLogin from '../pages/employee/EmployeeLogin';
import EmployerCompleteSignup from '../pages/employer/EmployerCompleteSignup';
import EmployerHome from '../pages/employer/EmployerHome';
import EmployerLogin from '../pages/employer/EmployerLogin';
import Landing from '../pages/Landing';
import { RequireRole } from './RequireRole';

// Rutas por rol (se completan al migrar cada pantalla del prototipo):
//   /empleado/*  → buscar, detalle, dashboard, analizador de CV, perfil, chat, notificaciones
//   /empleador/* → vacantes, pipeline, publicar, perfil de empresa, configuración
//   /admin/*     → resumen, empresas y ofertas, usuarios
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth/callback" element={<OAuthCallback />} />
      <Route path="/recuperar-contrasena" element={<ForgotPassword />} />
      <Route path="/restablecer-contrasena" element={<ResetPassword />} />

      <Route path="/empleado">
        <Route path="login" element={<EmployeeLogin mode="login" />} />
        <Route path="registro" element={<EmployeeLogin mode="register" />} />
        <Route element={<RequireRole role="EMPLOYEE" />}>
          <Route index element={<EmployeeHome />} />
          <Route path="*" element={<Navigate to="/empleado" replace />} />
        </Route>
      </Route>

      <Route path="/empleador">
        <Route path="login" element={<EmployerLogin mode="login" />} />
        <Route path="registro" element={<EmployerLogin mode="register" />} />
        <Route path="completar-registro" element={<EmployerCompleteSignup />} />
        <Route element={<RequireRole role="EMPLOYER" />}>
          <Route index element={<EmployerHome />} />
          <Route path="*" element={<Navigate to="/empleador" replace />} />
        </Route>
      </Route>

      <Route path="/admin">
        <Route path="login" element={<AdminLogin />} />
        <Route element={<RequireRole role="ADMIN" />}>
          <Route index element={<AdminHome />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
