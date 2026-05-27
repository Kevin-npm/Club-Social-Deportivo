import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RedirectByRole = () => {
  const { user } = useAuth();
  const roleStr = user?.roleString || "admin";

  if (roleStr === "admin") return <Navigate to="/actividades" replace />;
  if (roleStr === "recepcion") return <Navigate to="/recepcion" replace />;
  if (roleStr === "instructor") return <Navigate to="/dashboard-instructor" replace />;
  if (roleStr === "socio") return <Navigate to="/socio" replace />;
  
  return <Navigate to="/dashboard" replace />;
};

export default RedirectByRole;