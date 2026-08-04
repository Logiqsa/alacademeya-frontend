export const ADMIN_ROLES = ["admin", "super-admin"];

export const isAdminRole = (role) => ADMIN_ROLES.includes(role);

export const APPROVED_STATUSES = ["active", "approved", "accepted"];

const normalizedStatus = (user) =>
  String(user?.registrationStatus || user?.status || "")
    .trim()
    .toLowerCase()
    .replaceAll("_", "-");

export const isActivated = (user) => {
  const status = normalizedStatus(user);
  return user?.isActive === true || APPROVED_STATUSES.includes(status);
};

export const isRegistrationIncomplete = (user) => {
  const status = normalizedStatus(user);
  return (
    user?.profileCompleted === false ||
    user?.isProfileComplete === false ||
    ["incomplete", "profile-incomplete", "pending-profile", "verified"].includes(status)
  );
};

export const isAwaitingApproval = (user) =>
  ["pending", "pending-review", "pending-approval", "under-review"].includes(
    normalizedStatus(user),
  );

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

  if (role === "teacher") return { path: "/teacher/settings", state };
  if (role === "student") return { path: "/student/settings", state };
  if (role === "parent") return { path: "/parent/settings", state };
  return null;
};

export const getDashboardPathByRole = (user, fallback = "/") => {
  const continuation = getRegistrationContinuation(user);
  if (continuation) return continuation.path;
  const role = user?.role;
  const isApproved = isActivated(user);
  const isPendingReview = isAwaitingApproval(user);

  if (role === "teacher") {
    return isApproved || isPendingReview
      ? "/teacher-dashboard"
      : "/account-state";
  }

  if (role === "student") {
    return isApproved || isPendingReview
      ? "/student-dashboard"
      : "/register/success";
  }

  if (role === "parent") {
    return "/parent-dashboard";
  }

  if (isAdminRole(role)) {
    return "/admin-dashboard";
  }

  return fallback;
};
