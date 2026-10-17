import { Navigate, Route, Routes } from 'react-router-dom';
import AdminHome from '../pages/admin/AdminHome';
import AdminLogin from '../pages/admin/AdminLogin';
import ForgotPassword from '../pages/auth/ForgotPassword';
import OAuthCallback from '../pages/auth/OAuthCallback';
import ResetPassword from '../pages/auth/ResetPassword';
import EmployeeLogin from '../pages/employee/EmployeeLogin';
import JobDetail from '../pages/employee/JobDetail';
import SearchJobs from '../pages/employee/SearchJobs';
import EmployerCompleteSignup from '../pages/employer/EmployerCompleteSignup';
import EmployerLogin from '../pages/employer/EmployerLogin';
import EmployerVacancies from '../pages/employer/EmployerVacancies';
import PublishVacancy from '../pages/employer/PublishVacancy';
import Landing from '../pages/Landing';
import { RequireRole } from './RequireRole';
import { EmployeeShell, EmployerShell } from './shells';

// Rutas por rol (se completan al migrar cada pantalla del prototipo):
//   /empleado/*  → buscar ✓, detalle ✓, dashboard, analizador de CV, perfil, chat, notificaciones
//   /empleador/* → vacantes ✓, publicar ✓, pipeline, perfil de empresa, configuración
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
          {/* Tras el login se llega a /empleado: saludo de la mascota en la búsqueda. */}
          <Route index element={<Navigate to="/empleado/buscar" replace state={{ welcome: true }} />} />
          <Route element={<EmployeeShell />}>
            <Route path="buscar" element={<SearchJobs />} />
            <Route path="vacantes/:id" element={<JobDetail />} />
          </Route>
          <Route path="*" element={<Navigate to="/empleado/buscar" replace />} />
        </Route>
      </Route>

      <Route path="/empleador">
        <Route path="login" element={<EmployerLogin mode="login" />} />
        <Route path="registro" element={<EmployerLogin mode="register" />} />
        <Route path="completar-registro" element={<EmployerCompleteSignup />} />
        <Route element={<RequireRole role="EMPLOYER" />}>
          <Route index element={<Navigate to="/empleador/vacantes" replace state={{ welcome: true }} />} />
          <Route element={<EmployerShell />}>
            <Route path="vacantes" element={<EmployerVacancies />} />
            <Route path="publicar" element={<PublishVacancy />} />
            <Route path="vacantes/:id/editar" element={<PublishVacancy />} />
          </Route>
          <Route path="*" element={<Navigate to="/empleador/vacantes" replace />} />
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
