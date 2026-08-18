import {
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { AuthContext } from "../context/authContext";

import {
  createUser,
  getUsers,
  updateUser,
} from "../services/requestService";

const INITIAL_FORM = {
  nombre: "",
  email: "",
  password: "",
  rol: "solicitante",
};

const ROLE_LABELS = {
  administrador: "Administrador",
  tecnico: "Técnico",
  solicitante: "Solicitante",
};

export default function UserManagement({
  onUsersChanged,
}) {
  const { user: currentUser } =
    useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState("");

  const [form, setForm] =
    useState(INITIAL_FORM);

  const [editingId, setEditingId] =
    useState(null);

  const [
    confirmingDeactivateId,
    setConfirmingDeactivateId,
  ] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getUsers();

      setUsers(data);
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError.message ||
          "No fue posible cargar los usuarios."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm(INITIAL_FORM);
    setEditingId(null);
  }

  function startEdit(user) {
    setError("");
    setSuccess("");
    setConfirmingDeactivateId(null);

    setEditingId(user.id);

    setForm({
      nombre: user.nombre,
      email: user.email,
      password: "",
      rol: user.rol,
    });
  }

  function cancelEdit() {
    resetForm();
    setError("");
    setSuccess("");
  }

  async function refreshAfterChange() {
    await loadUsers();

    if (onUsersChanged) {
      await onUsersChanged();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      if (editingId) {
        const isEditingCurrentUser =
          Number(editingId) ===
          Number(currentUser?.id);

        const payload = {
          nombre: form.nombre.trim(),
          email: form.email.trim(),
        };

        if (!isEditingCurrentUser) {
          payload.rol = form.rol;
        }

        if (form.password) {
          payload.password = form.password;
        }

        await updateUser(
          editingId,
          payload
        );

        setSuccess(
          "Usuario actualizado correctamente."
        );
      } else {
        await createUser({
          nombre: form.nombre.trim(),
          email: form.email.trim(),
          password: form.password,
          rol: form.rol,
        });

        setSuccess(
          "Usuario creado correctamente."
        );
      }

      resetForm();
      await refreshAfterChange();
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError.message ||
          "No fue posible guardar el usuario."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(user) {
    const isCurrentUser =
      Number(user.id) ===
      Number(currentUser?.id);

    if (isCurrentUser) {
      setError(
        "No puede desactivar su propia cuenta."
      );

      return;
    }

    const isActive =
      Number(user.activo) === 1;

    if (
      isActive &&
      confirmingDeactivateId !== user.id
    ) {
      setConfirmingDeactivateId(
        user.id
      );

      return;
    }

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await updateUser(user.id, {
        activo: isActive ? 0 : 1,
      });

      setSuccess(
        isActive
          ? `${user.nombre} fue desactivado correctamente.`
          : `${user.nombre} fue activado correctamente.`
      );

      setConfirmingDeactivateId(null);

      if (
        editingId === user.id &&
        isActive
      ) {
        resetForm();
      }

      await refreshAfterChange();
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError.message ||
          "No fue posible cambiar el estado del usuario."
      );

      setConfirmingDeactivateId(null);
    } finally {
      setSaving(false);
    }
  }

  const isEditingCurrentUser =
    Number(editingId) ===
    Number(currentUser?.id);

  return (
    <section className="card user-management">
      <div className="section-heading">
        <div>
          <h2>Gestión de usuarios</h2>

          <p>
            Cree, edite, active o desactive
            cuentas del sistema.
          </p>
        </div>

        <div className="user-summary">
          <span>Usuarios</span>

          <strong>{users.length}</strong>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <div className="user-management-layout">
        <div className="user-form-panel">
          <div className="user-form-heading">
            <div>
              <h3>
                {editingId
                  ? "Editar usuario"
                  : "Nuevo usuario"}
              </h3>

              <p>
                {editingId
                  ? "Actualice los datos de la cuenta seleccionada."
                  : "Registre una nueva cuenta para acceder a NovaTech."}
              </p>
            </div>
          </div>

          <form
            className="user-form"
            onSubmit={handleSubmit}
          >
            <label
              className="form-field"
              htmlFor="user-name"
            >
              Nombre

              <input
                id="user-name"
                name="nombre"
                type="text"
                value={form.nombre}
                onChange={handleChange}
                maxLength={100}
                required
                disabled={saving}
                placeholder="Nombre completo"
              />
            </label>

            <label
              className="form-field"
              htmlFor="user-email"
            >
              Correo electrónico

              <input
                id="user-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                maxLength={120}
                required
                disabled={saving}
                placeholder="usuario@novatech.com"
              />
            </label>

            <label
              className="form-field"
              htmlFor="user-role"
            >
              Rol

              <select
                id="user-role"
                name="rol"
                value={form.rol}
                onChange={handleChange}
                required
                disabled={
                  saving ||
                  isEditingCurrentUser
                }
              >
                <option value="solicitante">
                  Solicitante
                </option>

                <option value="tecnico">
                  Técnico
                </option>

                <option value="administrador">
                  Administrador
                </option>
              </select>

              {isEditingCurrentUser && (
                <span className="user-field-help">
                  No puede cambiar el rol de
                  su propia cuenta.
                </span>
              )}
            </label>

            <label
              className="form-field"
              htmlFor="user-password"
            >
              {editingId
                ? "Nueva contraseña"
                : "Contraseña"}

              <input
                id="user-password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                minLength={8}
                maxLength={255}
                required={!editingId}
                disabled={saving}
                autoComplete="new-password"
                placeholder={
                  editingId
                    ? "Dejar vacío para conservarla"
                    : "Mínimo 8 caracteres"
                }
              />
            </label>

            <div className="user-form-actions">
              <button
                type="submit"
                className="button"
                disabled={saving}
              >
                {saving
                  ? "Guardando..."
                  : editingId
                    ? "Guardar cambios"
                    : "Crear usuario"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="user-list-panel">
          {loading ? (
            <p>Cargando usuarios...</p>
          ) : users.length === 0 ? (
            <div className="empty-state">
              No hay usuarios registrados.
            </div>
          ) : (
            <div className="user-list">
              {users.map((user) => {
                const isActive =
                  Number(user.activo) === 1;

                const isConfirming =
                  confirmingDeactivateId ===
                  user.id;

                const isCurrentUser =
                  Number(user.id) ===
                  Number(currentUser?.id);

                return (
                  <article
                    key={user.id}
                    className={`user-card ${
                      isActive
                        ? ""
                        : "user-card-inactive"
                    }`}
                  >
                    <div className="user-card-main">
                      <div className="user-avatar">
                        {user.nombre
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="user-card-info">
                        <div className="user-card-title">
                          <strong>
                            {user.nombre}
                          </strong>

                          <span
                            className={`user-status ${
                              isActive
                                ? "user-status-active"
                                : "user-status-inactive"
                            }`}
                          >
                            {isActive
                              ? "Activo"
                              : "Inactivo"}
                          </span>

                          {isCurrentUser && (
                            <span className="user-current-badge">
                              Tu cuenta
                            </span>
                          )}
                        </div>

                        <span className="user-email">
                          {user.email}
                        </span>

                        <span className="user-role">
                          {ROLE_LABELS[
                            user.rol
                          ] || user.rol}
                        </span>
                      </div>
                    </div>

                    {isConfirming ? (
                      <div className="user-deactivate-confirmation">
                        <p>
                          ¿Desactivar esta
                          cuenta? El usuario no
                          podrá iniciar sesión.
                        </p>

                        <div className="user-card-actions">
                          <button
                            type="button"
                            className="button button-secondary"
                            onClick={() =>
                              setConfirmingDeactivateId(
                                null
                              )
                            }
                            disabled={saving}
                          >
                            Cancelar
                          </button>

                          <button
                            type="button"
                            className="button"
                            onClick={() =>
                              handleToggleActive(
                                user
                              )
                            }
                            disabled={saving}
                          >
                            Desactivar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="user-card-actions">
                        <button
                          type="button"
                          className="button button-secondary"
                          onClick={() =>
                            startEdit(user)
                          }
                          disabled={saving}
                        >
                          Editar
                        </button>

                        {!isCurrentUser && (
                          <button
                            type="button"
                            className="button button-secondary"
                            onClick={() =>
                              handleToggleActive(
                                user
                              )
                            }
                            disabled={saving}
                          >
                            {isActive
                              ? "Desactivar"
                              : "Activar"}
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}