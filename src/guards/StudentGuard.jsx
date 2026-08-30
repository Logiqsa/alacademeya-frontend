import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  getRegistrationContinuation,
  isActivated,
  isAwaitingApproval,
  isRegistrationIncomplete,
} from "../utils/roles";

const StudentGuard = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" replace />;

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

  if (
    !isActivated(user) &&
    !isRegistrationIncomplete(user) &&
    !isAwaitingApproval(user)
  ) {
    return <Navigate to="/pending" replace />;
  }

  return children;
};

export default StudentGuard;
