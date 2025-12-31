import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      className="glass"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        padding: "1rem 0",
        borderBottom: "1px solid var(--border-light)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="container flex items-center justify-between">
        <Link
          to="/dashboard"
          className="flex items-center gap-md"
          style={{ textDecoration: "none" }}
        >
          <i
            className="bi bi-shield-check"
            style={{ fontSize: "2rem", color: "var(--primary-600)" }}
          ></i>
          <div>
            <h2
              style={{
                fontSize: "1.5rem",
                margin: 0,
                color: "var(--text-primary)",
              }}
            >
              LegalVault
            </h2>
            <p
              style={{
                fontSize: "0.75rem",
                margin: 0,
                color: "var(--text-secondary)",
              }}
            >
              Case Management System
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-lg">
          <Link
            to="/dashboard"
            className="flex items-center gap-sm"
            style={{
              color: "var(--text-primary)",
              fontWeight: 500,
              transition: "color var(--transition-fast)",
            }}
          >
            <i className="bi bi-grid"></i>
            Dashboard
          </Link>

          <div
            className="flex items-center gap-md"
            style={{
              padding: "0.5rem 1rem",
              background: "var(--bg-secondary)",
              borderRadius: "var(--radius-full)",
            }}
          >
            <i
              className="bi bi-person-circle"
              style={{ fontSize: "1.5rem", color: "var(--primary-600)" }}
            ></i>
            <div>
              <p style={{ fontSize: "0.875rem", fontWeight: 600, margin: 0 }}>
                {user?.user_metadata?.full_name || user?.email}
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  margin: 0,
                  color: "var(--text-secondary)",
                }}
              >
                {user?.email}
              </p>
            </div>
          </div>

          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            <i className="bi bi-box-arrow-right"></i>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
