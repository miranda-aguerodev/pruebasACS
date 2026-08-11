import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLE_ROUTES } from "../helpers/constants";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const user = await login(
        form.email,
        form.password
      );

      navigate(ROLE_ROUTES[user.rol]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">NovaTech</div>

        <h1>Bienvenido</h1>

        <p>
          Sistema de Gestión de Solicitudes de
          Mantenimiento
        </p>

        <form
          className="form"
          onSubmit={handleSubmit}
        >
          <label>
            Correo electrónico

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="correo@novatech.com"
              required
            />
          </label>

          <label>
            Contraseña

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <button
            className="button button-primary button-full"
            disabled={loading}
          >
            {loading
              ? "Ingresando..."
              : "Iniciar sesión"}
          </button>
        </form>

        <div className="demo-users">
          <strong>Usuarios de demostración</strong>
          <span>Administrador: admin@novatech.com</span>
          <span>Técnico: tecnico@novatech.com</span>
          <span>Solicitante: usuario@novatech.com</span>
        </div>
      </div>
    </div>
  );
}