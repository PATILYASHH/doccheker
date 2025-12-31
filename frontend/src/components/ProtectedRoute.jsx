import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
