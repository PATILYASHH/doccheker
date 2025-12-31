import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { login, googleAuth } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load Google Identity Services
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInButton"),
        {
          theme: "outline",
          size: "large",
          width: "100%",
          text: "signin_with",
        }
      );
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleResponse = async (response) => {
    setLoading(true);
    setError("");

    const result = await googleAuth(response.credential);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-secondary)",
        padding: "2rem 1rem",
      }}
    >
      {/* Background Pattern */}
      <div
        className="grid-pattern"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.3,
        }}
      ></div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "440px",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <Link
            to="/"
            className="flex items-center justify-center gap-sm"
            style={{ textDecoration: "none", marginBottom: "1rem" }}
          >
            <i
              className="bi bi-shield-check"
              style={{ fontSize: "2.5rem", color: "var(--text-primary)" }}
            ></i>
          </Link>
          <h1
            style={{
              fontSize: "2rem",
              marginBottom: "0.5rem",
              fontWeight: 700,
            }}
          >
            Welcome back
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Form Card */}
        <div className="card" style={{ padding: "2.5rem" }}>
          {/* Google Sign-In Button */}
          <div id="googleSignInButton" style={{ marginBottom: "1.5rem" }}></div>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              margin: "1.5rem 0",
              color: "var(--text-secondary)",
              fontSize: "0.875rem",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "var(--border-light)",
              }}
            ></div>
            <span style={{ padding: "0 1rem" }}>OR</span>
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "var(--border-light)",
              }}
            ></div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <div className="flex items-center justify-between mb-2">
                <label className="form-label" style={{ marginBottom: 0 }}>
                  Password
                </label>
                <a
                  href="#"
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  background: "#fee2e2",
                  border: "1px solid #fecaca",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "1.5rem",
                  fontSize: "0.875rem",
                  color: "var(--danger-600)",
                }}
              >
                <i className="bi bi-exclamation-circle"></i> {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: "100%", marginBottom: "1rem" }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div
                    className="spinner"
                    style={{
                      width: "20px",
                      height: "20px",
                      borderWidth: "2px",
                    }}
                  ></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <i className="bi bi-arrow-right"></i>
                </>
              )}
            </button>

            <div
              style={{
                textAlign: "center",
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
              }}
            >
              Don't have an account?{" "}
              <Link
                to="/signup"
                style={{ color: "var(--text-primary)", fontWeight: 600 }}
              >
                Sign up
              </Link>
            </div>
          </form>
        </div>

        {/* Back to Home */}
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link
            to="/"
            className="flex items-center justify-center gap-sm"
            style={{
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
            }}
          >
            <i className="bi bi-arrow-left"></i>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
