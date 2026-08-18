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
  const [confirmingFinish, setConfirmingFinish] =
    useState(false);

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

      return true;
    } catch (error) {
      showFeedback(error.message, "error");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmFinish() {
    const success = await changeStatus("finalizada");

    if (success) {
      setConfirmingFinish(false);

      showFeedback(
        "Solicitud finalizada correctamente."
      );
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

      {request.estado === "en_proceso" &&
        !confirmingFinish && (
          <button
            className="button button-success button-small"
            disabled={saving}
            onClick={() => setConfirmingFinish(true)}
          >
            Finalizar
          </button>
        )}

      {request.estado === "en_proceso" &&
        confirmingFinish && (
          <div
            className="finish-confirmation"
            role="alert"
          >
            <div className="finish-confirmation-text">
              <strong>
                ¿Finalizar esta solicitud?
              </strong>

              <span>
                Después de finalizarla no podrá agregar
                más comentarios, salvo que un
                administrador la reabra.
              </span>
            </div>

            <div className="finish-confirmation-actions">
              <button
                type="button"
                className="button button-secondary button-small"
                disabled={saving}
                onClick={() =>
                  setConfirmingFinish(false)
                }
              >
                Cancelar
              </button>

              <button
                type="button"
                className="button button-success button-small"
                disabled={saving}
                onClick={handleConfirmFinish}
              >
                {saving
                  ? "Finalizando..."
                  : "Finalizar solicitud"}
              </button>
            </div>
          </div>
        )}

      {!isCompleted && !confirmingFinish && (
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