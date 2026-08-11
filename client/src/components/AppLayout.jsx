import { useAuth } from "../hooks/useAuth";

export default function AppLayout({
  title,
  subtitle,
  children,
}) {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <div className="brand">NovaTech</div>
          <div className="user-info">
            {user?.nombre} · {user?.rol}
          </div>
        </div>

        <button
          className="button button-secondary"
          onClick={logout}
        >
          Cerrar sesión
        </button>
      </header>

      <main className="page">
        <div className="page-heading">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>

        {children}
      </main>
    </div>
  );
}