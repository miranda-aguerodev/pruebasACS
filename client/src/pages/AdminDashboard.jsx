import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AppLayout from "../components/AppLayout";
import RequestTable from "../components/RequestTable";
import AdminRequestActions from "../components/AdminRequestActions";

import { useRequests } from "../hooks/useRequests";

import {
  getTechnicians,
} from "../services/requestService";

import {
  PRIORITIES,
  STATUSES,
} from "../helpers/constants";

export default function AdminDashboard() {
  const {
    requests,
    loading,
    error,
    reload,
  } = useRequests();

  const [technicians, setTechnicians] = useState([]);

  const [filters, setFilters] = useState({
    estado: "",
    prioridad: "",
    tecnico_id: "",
  });

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

  function handleFilterChange(event) {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function clearFilters() {
    setFilters({
      estado: "",
      prioridad: "",
      tecnico_id: "",
    });
  }

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesStatus =
        !filters.estado ||
        request.estado === filters.estado;

      const matchesPriority =
        !filters.prioridad ||
        request.prioridad === filters.prioridad;

      let matchesTechnician = true;

      if (filters.tecnico_id === "sin_asignar") {
        matchesTechnician =
          request.tecnico_id === null ||
          request.tecnico_id === undefined;
      } else if (filters.tecnico_id) {
        matchesTechnician =
          String(request.tecnico_id) ===
          filters.tecnico_id;
      }

      return (
        matchesStatus &&
        matchesPriority &&
        matchesTechnician
      );
    });
  }, [requests, filters]);

  const stats = {
    total: requests.length,

    pending: requests.filter(
      (request) =>
        request.estado === "pendiente"
    ).length,

    inProgress: requests.filter(
      (request) =>
        request.estado === "en_proceso"
    ).length,

    completed: requests.filter(
      (request) =>
        request.estado === "finalizada"
    ).length,

    closed: requests.filter(
      (request) =>
        request.estado === "cerrada"
    ).length,
  };

  const hasActiveFilters =
    filters.estado ||
    filters.prioridad ||
    filters.tecnico_id;

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
            <h2>Reportes y filtros</h2>
            <p>
              Consulte solicitudes por estado,
              prioridad o responsable.
            </p>
          </div>

          <div className="report-result-count">
            <span>Resultados</span>

            <strong>
              {filteredRequests.length}
              {" / "}
              {requests.length}
            </strong>
          </div>
        </div>

        <div className="report-filter-grid">
          <label
            className="form-field"
            htmlFor="report-status"
          >
            Estado

            <select
              id="report-status"
              name="estado"
              value={filters.estado}
              onChange={handleFilterChange}
            >
              <option value="">
                Todos los estados
              </option>

              {STATUSES.map((status) => (
                <option
                  key={status.value}
                  value={status.value}
                >
                  {status.label}
                </option>
              ))}
            </select>
          </label>

          <label
            className="form-field"
            htmlFor="report-priority"
          >
            Prioridad

            <select
              id="report-priority"
              name="prioridad"
              value={filters.prioridad}
              onChange={handleFilterChange}
            >
              <option value="">
                Todas las prioridades
              </option>

              {PRIORITIES.map((priority) => (
                <option
                  key={priority.value}
                  value={priority.value}
                >
                  {priority.label}
                </option>
              ))}
            </select>
          </label>

          <label
            className="form-field"
            htmlFor="report-technician"
          >
            Responsable

            <select
              id="report-technician"
              name="tecnico_id"
              value={filters.tecnico_id}
              onChange={handleFilterChange}
            >
              <option value="">
                Todos los responsables
              </option>

              <option value="sin_asignar">
                Sin asignar
              </option>

              {technicians.map((technician) => (
                <option
                  key={technician.id}
                  value={technician.id}
                >
                  {technician.nombre}
                </option>
              ))}
            </select>
          </label>

          <div className="report-filter-action">
            <button
              type="button"
              className="button button-secondary"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Solicitudes</h2>

            <p>
              {hasActiveFilters
                ? `Mostrando ${filteredRequests.length} solicitud${
                    filteredRequests.length === 1
                      ? ""
                      : "es"
                  } que coinciden con los filtros.`
                : "Asigne responsables, prioridades y estados."}
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
        ) : filteredRequests.length === 0 ? (
          <div className="empty-state">
            No hay solicitudes que coincidan con
            los filtros seleccionados.
          </div>
        ) : (
          <RequestTable
            requests={filteredRequests}
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