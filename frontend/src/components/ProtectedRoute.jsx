import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const { token, user } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    if (user.role === "socio") {
      return <Navigate to="/socio" replace />;
    }

    if (user.role === "instructor") {
      return <Navigate to="/calendario-instructor" replace />;
    }

    if (user.role === "admin") {
      return <Navigate to="/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}