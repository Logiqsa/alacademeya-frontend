import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import TeacherGuard from "./TeacherGuard";
import InstructorGuard from "./InstructorGuard";

// Shared communication pages are available to academic teachers and active
// marketplace instructors. Each account type keeps its own existing guard.
const TeacherOrInstructorGuard = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (user?.role === "teacher") {
    return <TeacherGuard>{children}</TeacherGuard>;
  }

  return (
    <InstructorGuard requireActiveStatus>
      {children}
    </InstructorGuard>
  );
};

export default TeacherOrInstructorGuard;
