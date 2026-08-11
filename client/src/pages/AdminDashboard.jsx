import { useEffect, useState } from "react";

import AppLayout from "../components/AppLayout";
import RequestTable from "../components/RequestTable";
import AdminRequestActions from "../components/AdminRequestActions";

import { useRequests } from "../hooks/useRequests";

import {
  getTechnicians,
} from "../services/requestService";

export default function AdminDashboard() {
  const {
    requests,
    loading,
    error,
    reload,
  } = useRequests();

  const [technicians, setTechnicians] = useState([]);

  useEffect(() => {
    async function loadTechnicians() {
      try {
        const data = await getTechnicians();
        setTechnicians(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadTechnicians();
  }, []);

const stats = {
  total: requests.length,

  pending: requests.filter(
    (request) => request.estado === "pendiente"
  ).length,

  inProgress: requests.filter(
    (request) => request.estado === "en_proceso"
  ).length,

  completed: requests.filter(
    (request) => request.estado === "finalizada"
  ).length,

  closed: requests.filter(
    (request) => request.estado === "cerrada"
  ).length,
};

  return (
    <AppLayout
      title="Panel de Administración"
      subtitle="Gestión y seguimiento de solicitudes de mantenimiento."
    >
      <div className="stats-grid">
  <div className="stat-card">
    <span>Total</span>
    <strong>{stats.total}</strong>
  </div>

  <div className="stat-card">
    <span>Pendientes</span>
    <strong>{stats.pending}</strong>
  </div>

  <div className="stat-card">
    <span>En proceso</span>
    <strong>{stats.inProgress}</strong>
  </div>

  <div className="stat-card">
    <span>Finalizadas</span>
    <strong>{stats.completed}</strong>
  </div>

  <div className="stat-card">
    <span>Cerradas</span>
    <strong>{stats.closed}</strong>
  </div>
</div>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Solicitudes</h2>
            <p>
              Asigne responsables, prioridades y estados.
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {loading ? (
          <p>Cargando solicitudes...</p>
        ) : (
          <RequestTable
            requests={requests}
            actions={(request) => (
              <AdminRequestActions
                request={request}
                technicians={technicians}
                onUpdated={reload}
              />
            )}
          />
        )}
      </section>
    </AppLayout>
  );
}