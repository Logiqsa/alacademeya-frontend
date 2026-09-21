import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  getDashboardPathByRole,
  getRegistrationContinuation,
  isAwaitingApproval,
} from "../utils/roles";

const LEARNER_ROLES = new Set(["user", "student", "teacher", "parent"]);

const StudentGuard = ({ children }) => {
  const { user, checkingAccountState } = useContext(AuthContext);

  // Authentication check.
  if (checkingAccountState) return null;
  if (!user) return <Navigate to="/login" replace />;

  // Role authorization. Marketplace learners may use any active ordinary role.
  if (!LEARNER_ROLES.has(user.role)) {
    return <Navigate to={getDashboardPathByRole(user, "/")} replace />;
  }

  // Account-state check.
  const continuation = getRegistrationContinuation(user);
  if (continuation) {
    return (
      <Navigate
        to={continuation.path}
        state={continuation.state}
        replace
      />
    );
  }

  if (user.role !== "student" && isAwaitingApproval(user)) {
    return <Navigate to="/pending" replace />;
  }

  return children;
};

export default StudentGuard;
