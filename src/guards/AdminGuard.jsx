import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { isAdminRole } from "../utils/roles";

const AdminGuard = ({ children }) => {
  const { user, checkingAccountState } = useContext(AuthContext);

  if (checkingAccountState) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdminRole(user.role)) {
    return <Navigate to="/account-state" replace />;
  }

  return children ?? <Outlet />;
};

export default AdminGuard;
