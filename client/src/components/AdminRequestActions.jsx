import { useEffect, useState } from "react";

import {
  PRIORITIES,
  STATUSES,
} from "../helpers/constants";

import {
  updateRequest,
} from "../services/requestService";

import RequestHistory from "./RequestHistory";
import { useAuth } from "../hooks/useAuth";

export default function AdminRequestActions({
  request,
  technicians,
  onUpdated,
}) {
  const { user } = useAuth();

  const [form, setForm] = useState({
    prioridad: request.prioridad,
    estado: request.estado,
    tecnico_id: request.tecnico_id || "",
  });

  const [saving, setSaving] = useState(false);

  const [feedback, setFeedback] = useState(null);

  const [
    showAdministrativeClose,
    setShowAdministrativeClose,
  ] = useState(false);

  const [closeReason, setCloseReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [relatedRequestId, setRelatedRequestId] =
    useState("");

  useEffect(() => {
    setForm({
      prioridad: request.prioridad,
      estado: request.estado,
      tecnico_id: request.tecnico_id || "",
    });
  }, [
    request.id,
    request.prioridad,
    request.estado,
    request.tecnico_id,
  ]);

  function showFeedback(message, type = "success") {
    setFeedback({
      message,
      type,
    });

    setTimeout(() => {
      setFeedback(null);
    }, 2500);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSave() {
    const technicianId =
      form.tecnico_id === ""
        ? null
        : Number(form.tecnico_id);

    if (
      form.estado === "en_proceso" &&
      !technicianId
    ) {
      showFeedback(
        "Debe asignar un técnico antes de iniciar el trabajo.",
        "error"
      );

      return;
    }

    if (
      form.estado === "finalizada" &&
      !technicianId
    ) {
      showFeedback(
        "La solicitud debe tener un técnico asignado para finalizarse.",
        "error"
      );

      return;
    }

    try {
      setSaving(true);

      await updateRequest(request.id, {
        prioridad: form.prioridad,
        estado: form.estado,
        tecnico_id: technicianId,
        usuario_id: user.id,
      });

      showFeedback(
        "Solicitud actualizada correctamente."
      );

      await onUpdated();
    } catch (error) {
      showFeedback(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleClose() {
    try {
      setSaving(true);

      await updateRequest(request.id, {
        estado: "cerrada",
        usuario_id: user.id,
      });

      showFeedback(
        "Solicitud cerrada correctamente."
      );

      await onUpdated();
    } catch (error) {
      showFeedback(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleReopen() {
    try {
      setSaving(true);

      await updateRequest(request.id, {
        estado: "en_proceso",
        usuario_id: user.id,
      });

      showFeedback(
        "Solicitud reabierta correctamente."
      );

      await onUpdated();
    } catch (error) {
      showFeedback(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleAdministrativeClose() {
    const finalReason =
      closeReason === "Otro"
        ? otherReason.trim()
        : closeReason.trim();

    if (!finalReason) {
      showFeedback(
        "Debe seleccionar un motivo de cierre.",
        "error"
      );

      return;
    }

    if (
      closeReason === "Solicitud duplicada" &&
      !relatedRequestId
    ) {
      showFeedback(
        "Indique la solicitud relacionada con el reporte duplicado.",
        "error"
      );

      return;
    }

    if (
      relatedRequestId &&
      Number(relatedRequestId) === Number(request.id)
    ) {
      showFeedback(
        "Una solicitud no puede relacionarse consigo misma.",
        "error"
      );

      return;
    }

    try {
      setSaving(true);

      await updateRequest(request.id, {
        estado: "cerrada",
        motivo_cierre: finalReason,
        solicitud_relacionada_id:
          relatedRequestId === ""
            ? undefined
            : Number(relatedRequestId),
        usuario_id: user.id,
      });

      setShowAdministrativeClose(false);
      setCloseReason("");
      setOtherReason("");
      setRelatedRequestId("");

      showFeedback(
        "Solicitud cerrada administrativamente."
      );

      await onUpdated();
    } catch (error) {
      showFeedback(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  const allowedStatusValues =
    request.estado === "pendiente"
      ? ["pendiente", "en_proceso"]
      : ["en_proceso", "finalizada"];

  const availableStatuses = STATUSES.filter(
    (status) =>
      allowedStatusValues.includes(status.value)
  );

  const originalTechnicianId =
    request.tecnico_id === null ||
    request.tecnico_id === undefined
      ? ""
      : String(request.tecnico_id);

  const hasChanges =
    form.prioridad !== request.prioridad ||
    form.estado !== request.estado ||
    String(form.tecnico_id) !== originalTechnicianId;

  if (request.estado === "cerrada") {
    return (
      <div className="request-actions">
        <span className="completed-message">
          ✓ Caso cerrado
        </span>

        <RequestHistory request={request} />

        {feedback && (
          <div
            className={`app-toast app-toast-${feedback.type}`}
            role="status"
            aria-live="polite"
          >
            <span className="app-toast-icon">
              {feedback.type === "success"
                ? "✓"
                : "!"}
            </span>

            <span>{feedback.message}</span>
          </div>
        )}
      </div>
    );
  }

  if (request.estado === "finalizada") {
    return (
      <div className="request-actions">
        <button
          className="button button-success button-small"
          disabled={saving}
          onClick={handleClose}
        >
          {saving
            ? "Procesando..."
            : "Cerrar solicitud"}
        </button>

        <button
          className="button button-secondary button-small"
          disabled={saving}
          onClick={handleReopen}
        >
          Reabrir
        </button>

        <RequestHistory request={request} />

        {feedback && (
          <div
            className={`app-toast app-toast-${feedback.type}`}
            role="status"
            aria-live="polite"
          >
            <span className="app-toast-icon">
              {feedback.type === "success"
                ? "✓"
                : "!"}
            </span>

            <span>{feedback.message}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="request-actions">
      <label
        className="request-action-field"
        htmlFor={`priority-${request.id}`}
      >
        <span>Prioridad</span>

        <select
          id={`priority-${request.id}`}
          name="prioridad"
          value={form.prioridad}
          onChange={handleChange}
          disabled={saving}
        >
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
        className="request-action-field"
        htmlFor={`status-${request.id}`}
      >
        <span>Estado</span>

        <select
          id={`status-${request.id}`}
          name="estado"
          value={form.estado}
          onChange={handleChange}
          disabled={saving}
        >
          {availableStatuses.map((status) => (
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
        className="request-action-field"
        htmlFor={`technician-${request.id}`}
      >
        <span>Técnico</span>

        <select
          id={`technician-${request.id}`}
          name="tecnico_id"
          value={form.tecnico_id}
          onChange={handleChange}
          disabled={saving}
        >
          <option value="">
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

      <button
        className="button button-primary button-small"
        onClick={handleSave}
        disabled={saving || !hasChanges}
        title={
          hasChanges
            ? "Guardar los cambios realizados"
            : "No hay cambios pendientes"
        }
      >
        {saving
          ? "Guardando..."
          : "Guardar cambios"}
      </button>

      {request.estado === "pendiente" && (
        <>
          <button
            className="button button-secondary button-small"
            disabled={saving}
            onClick={() =>
              setShowAdministrativeClose(
                (current) => !current
              )
            }
          >
            {showAdministrativeClose
              ? "Cancelar cierre"
              : "Cerrar administrativamente"}
          </button>

          {showAdministrativeClose && (
            <div className="administrative-close-box">
              <label
                className="request-action-field"
                htmlFor={`close-reason-${request.id}`}
              >
                <span>Motivo de cierre</span>

                <select
                  id={`close-reason-${request.id}`}
                  value={closeReason}
                  onChange={(event) => {
                    setCloseReason(
                      event.target.value
                    );

                    if (
                      event.target.value !== "Otro"
                    ) {
                      setOtherReason("");
                    }

                    if (
                      event.target.value !==
                      "Solicitud duplicada"
                    ) {
                      setRelatedRequestId("");
                    }
                  }}
                  disabled={saving}
                >
                  <option value="">
                    Seleccione motivo...
                  </option>

                  <option value="Solicitud duplicada">
                    Solicitud duplicada
                  </option>

                  <option value="Reporte inválido">
                    Reporte inválido
                  </option>

                  <option value="Ya resuelto">
                    Ya resuelto
                  </option>

                  <option value="Otro">
                    Otro
                  </option>
                </select>
              </label>

              {closeReason === "Otro" && (
                <label
                  className="request-action-field"
                  htmlFor={`other-reason-${request.id}`}
                >
                  <span>Detalle del motivo</span>

                  <input
                    id={`other-reason-${request.id}`}
                    type="text"
                    value={otherReason}
                    onChange={(event) =>
                      setOtherReason(
                        event.target.value
                      )
                    }
                    placeholder="Especifique el motivo..."
                    disabled={saving}
                  />
                </label>
              )}

              {closeReason ===
                "Solicitud duplicada" && (
                <label
                  className="request-action-field"
                  htmlFor={`related-request-${request.id}`}
                >
                  <span>
                    Solicitud relacionada
                  </span>

                  <input
                    id={`related-request-${request.id}`}
                    type="number"
                    min="1"
                    value={relatedRequestId}
                    onChange={(event) =>
                      setRelatedRequestId(
                        event.target.value
                      )
                    }
                    placeholder="Ej. 6"
                    disabled={saving}
                  />
                </label>
              )}

              <button
                className="button button-success button-small"
                disabled={saving}
                onClick={
                  handleAdministrativeClose
                }
              >
                {saving
                  ? "Procesando..."
                  : "Confirmar cierre"}
              </button>
            </div>
          )}
        </>
      )}

      <RequestHistory request={request} />

      {feedback && (
        <div
          className={`app-toast app-toast-${feedback.type}`}
          role="status"
          aria-live="polite"
        >
          <span className="app-toast-icon">
            {feedback.type === "success"
              ? "✓"
              : "!"}
          </span>

          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
}