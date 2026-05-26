import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import RedirectByRole from "./components/RedirectByRole";

import MainLayout from "./layouts/MainLayout";
import SocioLayout from "./layouts/SocioLayout";

import Login from "./pages/Login";
import SetPassword from "./pages/SetPassword";

import Dashboard from "./pages/Dashboard";
import DashboardInstructor from "./pages/DashboardInstructor";
import Recepcion from "./pages/Recepcion";
import Socios from "./pages/Socios";
import CheckIn from "./pages/Checkin";
import Instalaciones from "./pages/Instalaciones";
import Dependientes from "./pages/Dependientes";
import Instructores from "./pages/Instructores";
import Actividades from "./pages/Actividades";
import Sesiones from "./pages/Sesiones";
import Pagos from "./pages/Pagos";
import Torneos from "./pages/Torneos";
import CalendarioInstructor from "./pages/CalendarioInstructor";
import SocioImport from "./pages/admin/SocioImport";

import SocioHome from "./pages/socio/SocioHome";
import SocioReservas from "./pages/socio/SocioReservas";
import SocioPagos from "./pages/socio/SocioPagos";
import SocioNotificaciones from "./pages/socio/SocioNotificaciones";

import MiCuenta from "./pages/MiCuenta";
import Configuracion from "./pages/Configuracion";

import Ludoteca from "./pages/Ludoteca";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/set-password" element={<SetPassword />} />

          {/* Redirección raíz según sesión/rol */}
          <Route path="/" element={<RedirectByRole />} />

          {/* Portal exclusivo para socios */}
          <Route
            path="/socio"
            element={
              <ProtectedRoute allowedRoles={["socio"]}>
                <SocioLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SocioHome />} />
            <Route path="reservas" element={<SocioReservas />} />
            <Route path="pagos" element={<SocioPagos />} />
            <Route path="notificaciones" element={<SocioNotificaciones />} />
          </Route>

          {/* Panel administrativo */}
<Route
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <MainLayout />
    </ProtectedRoute>
  }
>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/ludoteca" element={<Ludoteca />} />
  <Route path="/instalaciones" element={<Instalaciones />} />
  <Route path="/recepcion" element={<Recepcion />} />
  <Route path="/socios" element={<Socios />} />
  <Route path="/dependientes" element={<Dependientes />} />
  <Route path="/instructores" element={<Instructores />} />
  <Route path="/torneos" element={<Torneos />} />
  <Route path="/check-in" element={<CheckIn />} />
  <Route path="/actividades" element={<Actividades />} />
  <Route path="/sesiones" element={<Sesiones />} />
  <Route path="/pagos" element={<Pagos />} />
  <Route path="/socios/importar" element={<SocioImport />} />

  {/* NUEVAS */}
  <Route path="/mi-cuenta" element={<MiCuenta />} />
  <Route path="/configuracion" element={<Configuracion />} />
</Route>

          {/* Panel exclusivo para instructor */}
<Route
  element={
    <ProtectedRoute allowedRoles={["instructor"]}>
      <MainLayout />
    </ProtectedRoute>
  }
>
  <Route
    path="/dashboard-instructor"
    element={<DashboardInstructor />}
  />

  <Route
    path="/calendario-instructor"
    element={<CalendarioInstructor />}
  />

  {/* NUEVAS */}
  <Route path="/mi-cuenta" element={<MiCuenta />} />
  <Route path="/configuracion" element={<Configuracion />} />
</Route>

          {/* Cualquier ruta inválida */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;