import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import RequesterDashboard from "./pages/RequesterDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="administrador">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tecnico"
        element={
          <ProtectedRoute allowedRole="tecnico">
            <TechnicianDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/solicitante"
        element={
          <ProtectedRoute allowedRole="solicitante">
            <RequesterDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}