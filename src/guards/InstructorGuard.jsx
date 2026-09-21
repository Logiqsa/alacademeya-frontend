import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  getRegistrationContinuation,
  canHaveInstructorProfile,
  isInstructor,
  isActivated,
  isAwaitingApproval,
} from "../utils/roles";
import { getMyInstructorProfile } from "../services/APIService";

const InstructorGuard = ({ children, requireProfile = true, allowSuspended = false, requireActiveStatus = false }) => {
  const { user, updateUser, checkingAccountState } = useContext(AuthContext);
  const [profileCheck, setProfileCheck] = useState({ state: "idle", profile: null });

  const needsBackendProfileCheck =
    Boolean(user) &&
    requireProfile &&
    canHaveInstructorProfile(user) &&
    isActivated(user) &&
    !isAwaitingApproval(user) &&
    (!isInstructor(user) || (requireActiveStatus && !user?.instructorStatus));

  useEffect(() => {
    if (!needsBackendProfileCheck) return;
    let active = true;
    getMyInstructorProfile()
      .then((response) => {
        if (!active) return;
        const payload = response.data?.data || response.data;
        const profile = payload?.instructor || payload?.profile || payload;
        const instructorId = profile?.id || profile?._id;
        if (!instructorId) {
          setProfileCheck({ state: "missing", profile: null });
          return;
        }
        updateUser?.((current) => ({
          ...current,
          accountType: "instructor",
          instructorId,
          instructorStatus: profile.status,
          instructorProfileSlug: profile.profileSlug || profile.slug || "",
        }));
        setProfileCheck({ state: "ready", profile });
      })
      .catch((error) => {
        if (!active) return;
        setProfileCheck({
          state: error.response?.status === 404 ? "missing" : "error",
          profile: null,
        });
      });
    return () => {
      active = false;
    };
  }, [needsBackendProfileCheck, updateUser]);

  if (checkingAccountState) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!canHaveInstructorProfile(user)) {
    return <Navigate to="/account-state" replace />;
  }

  const continuation = getRegistrationContinuation(user);
  if (continuation) {
    return <Navigate to={continuation.path} state={continuation.state} replace />;
  }
  if (isAwaitingApproval(user)) {
    return <Navigate to="/pending" replace />;
  }
  if (!requireProfile) return children;
  if (needsBackendProfileCheck && profileCheck.state === "idle") return null;
  const instructorStatus =
    profileCheck.profile?.status || user.instructorStatus;
  if (instructorStatus === "suspended" && !allowSuspended) {
    return <Navigate to="/account-state" replace />;
  }
  if (requireActiveStatus && instructorStatus !== "active") {
    return <Navigate to="/account-state" replace />;
  }
  if (!isInstructor(user) && profileCheck.state !== "ready") {
    // Never open the create/edit profile form as an automatic fallback.
    // Onboarding is reached only through an explicit user action.
    return <Navigate to="/account-state" replace />;
  }
  return children;
};

export default InstructorGuard;
