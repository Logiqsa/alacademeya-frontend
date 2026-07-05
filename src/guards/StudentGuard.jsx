import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const StudentGuard = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" replace />;

  const isApproved =
    user.isActive === true && user.registrationStatus === "active";

  if (!isApproved) return <Navigate to="/pending" replace />;

  return children;
};

export default StudentGuard;