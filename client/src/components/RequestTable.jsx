import StatusBadge from "./StatusBadge";
import { formatPriority } from "../helpers/formatters";

export default function RequestTable({
  requests,
  actions,
}) {
  if (!requests.length) {
    return (
      <div className="empty-state">
        No hay solicitudes para mostrar.
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="request-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Descripción</th>
            <th>Ubicación</th>
            <th>Categoría</th>
            <th>Prioridad</th>
            <th>Estado</th>
            <th>Solicitante</th>
            <th>Técnico</th>

            {actions && <th>Acciones</th>}
          </tr>
        </thead>

        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td>#{request.id}</td>

              <td className="description-cell">
                {request.descripcion}
              </td>

              <td>{request.ubicacion}</td>
              <td>{request.categoria}</td>

              <td>
                <span
                  className={`priority priority-${request.prioridad}`}
                >
                  {formatPriority(request.prioridad)}
                </span>
              </td>

              <td>
                <StatusBadge status={request.estado} />
              </td>

              <td>
                {request.solicitante || "—"}
              </td>

              <td>
                {request.tecnico || "Sin asignar"}
              </td>

              {actions && (
                <td>
                  {actions(request)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}