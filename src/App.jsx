// ==========================================
// HOSTLY — Enrutador principal
// Protege rutas según rol del usuario
// ==========================================

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ReservasPage from "./pages/ReservasPage";
import CheckinPage from "./pages/CheckinPage";
import CheckoutPage from "./pages/CheckoutPage";
import HabitacionesPage from "./pages/HabitacionesPage";
import ClientesPage from "./pages/ClientesPage";
import ServicioPage from "./pages/ServicioPage";
import ReportesPage from "./pages/ReportesPage";
import IngresosPage from "./pages/IngresosPage";
import AccesosPage from "./pages/AccesosPage";
import { useEffect } from "react";
import { seedHabitaciones } from "./firebase/firestore";

// Rutas permitidas por rol
const ROL_RUTAS = {
  recepcionista: [
    "/",
    "/reservas",
    "/checkin",
    "/checkout",
    "/habitaciones",
    "/clientes"
  ],

  servicio: [
    "/servicio"
  ],

  contador: [
    "/reportes",
    "/ingresos"
  ],

  vigilante: [
    "/accesos"
  ],
};

const ProtectedRoute = ({ children, ruta }) => {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        Cargando Hostly...
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  const permitidas = ROL_RUTAS[usuario.rol] || [];

  if (!permitidas.includes(ruta)) {
    return (
      <Navigate
        to={permitidas[0] || "/login"}
        replace
      />
    );
  }

  return children;
};

export default function App() {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        Iniciando Hostly...
      </div>
    );
  }

  if (!usuario) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>

        {/* Recepcionista */}
        <Route
          index
          element={
            <ProtectedRoute ruta="/">
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="reservas"
          element={
            <ProtectedRoute ruta="/reservas">
              <ReservasPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="checkin"
          element={
            <ProtectedRoute ruta="/checkin">
              <CheckinPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="checkout"
          element={
            <ProtectedRoute ruta="/checkout">
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="habitaciones"
          element={
            <ProtectedRoute ruta="/habitaciones">
              <HabitacionesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="clientes"
          element={
            <ProtectedRoute ruta="/clientes">
              <ClientesPage />
            </ProtectedRoute>
          }
        />

        {/* Servicio */}
        <Route
          path="servicio"
          element={
            <ProtectedRoute ruta="/servicio">
              <ServicioPage />
            </ProtectedRoute>
          }
        />

        {/* Contador */}
        <Route
          path="reportes"
          element={
            <ProtectedRoute ruta="/reportes">
              <ReportesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="ingresos"
          element={
            <ProtectedRoute ruta="/ingresos">
              <IngresosPage />
            </ProtectedRoute>
          }
        />

        {/* Vigilante */}
        <Route
          path="accesos"
          element={
            <ProtectedRoute ruta="/accesos">
              <AccesosPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}