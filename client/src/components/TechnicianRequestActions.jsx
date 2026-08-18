import { useState } from "react";

import {
  addComment,
  updateRequest,
} from "../services/requestService";

import RequestHistory from "./RequestHistory";

export default function TechnicianRequestActions({
  request,
  user,
  onUpdated,
}) {
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  function showFeedback(message, type = "success") {
    setFeedback({
      message,
      type,
    });

    setTimeout(() => {
      setFeedback(null);
    }, 2500);
  }

  async function changeStatus(status) {
    try {
      setSaving(true);

      await updateRequest(request.id, {
        estado: status,
        usuario_id: user.id,
      });

      await onUpdated();
    } catch (error) {
      showFeedback(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleComment() {
    if (!comment.trim()) {
      return;
    }

    try {
      setSaving(true);

      await addComment(request.id, {
        usuario_id: user.id,
        comentario: comment.trim(),
      });

      setComment("");

      showFeedback(
        "Comentario registrado correctamente."
      );
    } catch (error) {
      showFeedback(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  const isCompleted =
    request.estado === "finalizada" ||
    request.estado === "cerrada";

  const isCommentEmpty = !comment.trim();

  return (
    <div className="technician-actions">
      {request.estado === "pendiente" && (
        <button
          className="button button-primary button-small"
          disabled={saving}
          onClick={() => changeStatus("en_proceso")}
        >
          {saving ? "Procesando..." : "Iniciar"}
        </button>
      )}

      {request.estado === "en_proceso" && (
        <button
          className="button button-success button-small"
          disabled={saving}
          onClick={() => changeStatus("finalizada")}
        >
          {saving ? "Procesando..." : "Finalizar"}
        </button>
      )}

      {!isCompleted && (
        <div className="comment-box">
          <input
            type="text"
            value={comment}
            onChange={(event) =>
              setComment(event.target.value)
            }
            placeholder="Agregar comentario..."
            disabled={saving}
          />

          <button
            className="button button-secondary button-small"
            disabled={saving || isCommentEmpty}
            onClick={handleComment}
            title={
              isCommentEmpty
                ? "Escriba un comentario para habilitar esta acción"
                : "Registrar comentario"
            }
          >
            {saving ? "Guardando..." : "Comentar"}
          </button>
        </div>
      )}

      {isCompleted && (
        <span className="completed-message">
          ✓ Trabajo completado
        </span>
      )}

      <RequestHistory request={request} />

      {feedback && (
        <div
          className={`app-toast app-toast-${feedback.type}`}
          role="status"
          aria-live="polite"
        >
          <span className="app-toast-icon">
            {feedback.type === "success" ? "✓" : "!"}
          </span>

          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
}