import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RedirectByRole() {
  const { token, user } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === "socio") {
    return <Navigate to="/socio" replace />;
  }

  if (user?.role === "instructor") {
    return <Navigate to="/calendario-instructor" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}