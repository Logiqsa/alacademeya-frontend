import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  getRegistrationContinuation,
  canHaveInstructorProfile,
  isInstructor,
  isActivated,
  isAwaitingApproval,
} from "../utils/roles";

const InstructorGuard = ({ children, requireProfile = true, allowSuspended = false }) => {
  const { user, checkingAccountState } = useContext(AuthContext);

  if (checkingAccountState) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!canHaveInstructorProfile(user)) {
    return <Navigate to="/account-state" replace />;
  }

  const continuation = getRegistrationContinuation(user);
  if (continuation) {
    return <Navigate to={continuation.path} state={continuation.state} replace />;
  }
  if (!isActivated(user) || isAwaitingApproval(user)) {
    return <Navigate to="/pending" replace />;
  }
  if (!requireProfile) return children;
  if (user.instructorStatus === "suspended" && !allowSuspended) {
    return <Navigate to="/account-state" replace />;
  }
  if (!isInstructor(user)) {
    return <Navigate to="/instructor/onboarding" replace />;
  }
  return children;
};

export default InstructorGuard;
