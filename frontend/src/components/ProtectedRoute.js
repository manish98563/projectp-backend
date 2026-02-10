import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("admin_token");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check token expiration
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_email");
      return <Navigate to="/admin/login" replace />;
    }
  } catch {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_email");
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
