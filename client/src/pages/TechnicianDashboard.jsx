import AppLayout from "../components/AppLayout";
import RequestTable from "../components/RequestTable";
import TechnicianRequestActions from "../components/TechnicianRequestActions";

import { useAuth } from "../hooks/useAuth";
import { useRequests } from "../hooks/useRequests";

export default function TechnicianDashboard() {
  const { user } = useAuth();

  const {
    requests,
    loading,
    error,
    reload,
  } = useRequests({
    tecnico_id: user.id,
  });

  return (
    <AppLayout
      title="Panel Técnico"
      subtitle="Solicitudes de mantenimiento asignadas."
    >
      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Mis solicitudes</h2>
            <p>Gestione las incidencias asignadas.</p>
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
              <TechnicianRequestActions
                request={request}
                user={user}
                onUpdated={reload}
              />
            )}
          />
        )}
      </section>
    </AppLayout>
  );
}