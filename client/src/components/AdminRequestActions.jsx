import { useState } from "react";

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

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSave() {
    try {
      setSaving(true);

      await updateRequest(request.id, {
        prioridad: form.prioridad,
        estado: form.estado,
        tecnico_id:
          form.tecnico_id === ""
            ? null
            : Number(form.tecnico_id),
        usuario_id: user.id,
      });

      await onUpdated();
    } catch (error) {
      alert(error.message);
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

      await onUpdated();
    } catch (error) {
      alert(error.message);
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

      await onUpdated();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (request.estado === "cerrada") {
    return (
      <div className="request-actions">
        <span className="completed-message">
          ✓ Caso cerrado
        </span>

        <RequestHistory request={request} />
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
          {saving ? "Procesando..." : "Cerrar solicitud"}
        </button>

        <button
          className="button button-secondary button-small"
          disabled={saving}
          onClick={handleReopen}
        >
          Reabrir
        </button>

        <RequestHistory request={request} />
      </div>
    );
  }

  return (
    <div className="request-actions">
      <select
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

      <select
        name="estado"
        value={form.estado}
        onChange={handleChange}
        disabled={saving}
      >
        {STATUSES
          .filter((status) => status.value !== "cerrada")
          .map((status) => (
            <option
              key={status.value}
              value={status.value}
            >
              {status.label}
            </option>
          ))}
      </select>

      <select
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

      <button
        className="button button-primary button-small"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Guardando..." : "Guardar"}
      </button>

      <RequestHistory request={request} />
    </div>
  );
}