export const ADMIN_ROLES = ["admin", "super-admin"];

export const isAdminRole = (role) => ADMIN_ROLES.includes(role);

export const APPROVED_STATUSES = ["active", "approved", "accepted"];

export const isActivated = (user) => {
  const status = String(user?.registrationStatus || user?.status || "").toLowerCase();
  return user?.isActive === true || APPROVED_STATUSES.includes(status);
};

export const isRegistrationIncomplete = (user) => {
  const status = String(user?.registrationStatus || user?.status || "").toLowerCase();
  return (
    user?.profileCompleted === false ||
    user?.isProfileComplete === false ||
    ["incomplete", "profile_incomplete", "verified"].includes(status)
  );
};

export const getRegistrationContinuation = (user, registrationData = {}) => {
  if (!isRegistrationIncomplete(user)) return null;

  const role = user?.role || registrationData.role;
  const state = {
    email: user?.email || registrationData.email,
    role,
    academicLevel: user?.academicLevel || registrationData.academicLevel,
    studentType: user?.studentType || registrationData.studentType,
    countryId:
      user?.country?.id ||
      user?.country?._id ||
      user?.country ||
      registrationData.countryId ||
      registrationData.country,
  };

  if (role === "teacher") return { path: "/register/teacher-details", state };
  if (role === "student" && state.studentType !== "university") {
    return { path: "/register/student-details", state };
  }
  if (role === "student") return { path: "/student-dashboard", state };
  if (role === "parent") return { path: "/parent-dashboard", state };
  return null;
};

export const getDashboardPathByRole = (user, fallback = "/") => {
  const continuation = getRegistrationContinuation(user);
  if (continuation) return continuation.path;
  const role = user?.role;
  const isApproved = isActivated(user);

  if (role === "teacher") {
    return isApproved ? "/teacher-dashboard" : "/account-state";
  }

  if (role === "student") {
    return isApproved ? "/student-dashboard" : "/register/success";
  }

  if (role === "parent") {
    return "/parent-dashboard";
  }

  if (isAdminRole(role)) {
    return "/admin-dashboard";
  }

  return fallback;
};
