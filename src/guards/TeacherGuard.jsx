import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const TeacherGuard = ({ children }) => {
  const { user } = useContext(AuthContext);
  console.log("TeacherGuard user:", user);

  if (!user) return <Navigate to="/login" replace />;

  const registrationStatus = user.registrationStatus === "approved";

  if (!registrationStatus) return <Navigate to="/account-state" replace />;

  return children;
};

export default TeacherGuard;