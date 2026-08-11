import { useState } from "react";

import AppLayout from "../components/AppLayout";
import RequestForm from "../components/RequestForm";
import RequestTable from "../components/RequestTable";
import RequestHistory from "../components/RequestHistory";

import { useAuth } from "../hooks/useAuth";
import { useRequests } from "../hooks/useRequests";

import {
  createRequest,
} from "../services/requestService";

export default function RequesterDashboard() {
  const { user } = useAuth();

  const {
    requests,
    loading,
    error,
    reload,
  } = useRequests({
    solicitante_id: user.id,
  });

  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  async function handleCreate(form) {
    try {
      setCreating(true);
      setMessage("");

      await createRequest({
        ...form,
        solicitante_id: user.id,
      });

      setMessage(
        "Solicitud registrada correctamente."
      );

      await reload();

      return true;
    } catch (err) {
      setMessage(err.message);
      return false;
    } finally {
      setCreating(false);
    }
  }

  return (
    <AppLayout
      title="Mis solicitudes"
      subtitle="Registre y consulte solicitudes de mantenimiento."
    >
      <div className="dashboard-grid">
        <section className="card">
          <div className="section-heading">
            <div>
              <h2>Nueva solicitud</h2>
              <p>
                Reporte una incidencia de mantenimiento.
              </p>
            </div>
          </div>

          {message && (
            <div className="alert alert-info">
              {message}
            </div>
          )}

          <RequestForm
            onSubmit={handleCreate}
            loading={creating}
          />
        </section>

        <section className="card">
          <div className="section-heading">
            <div>
              <h2>Solicitudes registradas</h2>
              <p>
                Consulte el estado de sus reportes.
              </p>
            </div>

            <span className="counter">
              {requests.length}
            </span>
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
                    <RequestHistory request={request} />
                )}
                />
          )}
        </section>
      </div>
    </AppLayout>
  );
}