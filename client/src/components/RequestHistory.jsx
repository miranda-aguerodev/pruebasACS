import { useEffect, useState } from "react";

import { getHistory } from "../services/requestService";
import { formatStatus } from "../helpers/formatters";

export default function RequestHistory({ request }) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    async function loadHistory() {
      try {
        setLoading(true);
        setError("");

        const data = await getHistory(request.id);
        setHistory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [open, request.id]);

  function formatDate(value) {
    if (!value) return "";

    return new Date(value).toLocaleString("es-CR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  function getItemTitle(item) {
    if (item.origen === "comentario") {
      return item.nombre || "Usuario";
    }

    return item.nombre || "Sistema NovaTech";
  }

  function getItemRole(item) {
    if (item.origen === "comentario") {
      return item.rol || "Comentario";
    }

    return "Evento del sistema";
  }

  return (
    <>
      <button
        className="button button-secondary button-small"
        onClick={() => setOpen(true)}
      >
        Ver historial
      </button>

      {open && (
        <div
          className="modal-overlay"
          onClick={() => setOpen(false)}
        >
          <div
            className="history-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="history-header">
              <div>
                <span className="history-id">
                  Solicitud #{request.id}
                </span>

                <h2>{request.descripcion}</h2>

                <p>
                  {request.ubicacion} · {request.categoria}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="history-summary">
              <div>
                <span>Estado actual</span>
                <strong>
                  {formatStatus(request.estado)}
                </strong>
              </div>

              <div>
                <span>Prioridad</span>
                <strong>{request.prioridad}</strong>
              </div>

              <div>
                <span>Técnico</span>
                <strong>
                  {request.tecnico || "Sin asignar"}
                </strong>
              </div>
            </div>

            <div className="history-content">
              <h3>Seguimiento</h3>

              {loading && (
                <p>Cargando historial...</p>
              )}

              {error && (
                <div className="alert alert-error">
                  {error}
                </div>
              )}

              {!loading &&
                !error &&
                history.length === 0 && (
                  <div className="empty-state">
                    Todavía no hay movimientos registrados.
                  </div>
                )}

              {!loading &&
                !error &&
                history.map((item) => (
                  <div
                    className="history-entry"
                    key={`${item.origen}-${item.id}`}
                  >
                    <div className="history-dot" />

                    <div>
                      <div className="history-entry-header">
                        <strong>
                          {getItemTitle(item)}
                        </strong>

                        <span>
                          {formatDate(item.fecha)}
                        </span>
                      </div>

                      <span className="history-role">
                        {getItemRole(item)}
                      </span>

                      <p>{item.contenido}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}