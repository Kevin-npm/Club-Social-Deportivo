import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.roleString)) {
    if (user.roleString === "socio") {
      return <Navigate to="/socio" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return children;
}