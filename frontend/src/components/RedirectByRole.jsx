import { Navigate } from "react-router-dom";
import { useRoleSimulator } from "../context/RoleSimulatorContext";

const RedirectByRole = () => {
  const { isAdmin } = useRoleSimulator();

  return isAdmin ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/calendario-instructor" replace />
  );
};

export default RedirectByRole;