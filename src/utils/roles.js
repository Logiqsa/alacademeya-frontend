export const ADMIN_ROLES = ["admin", "super-admin"];
export const INSTRUCTOR_ELIGIBLE_ROLES = ["user", "teacher"];

export const isAdminRole = (role) => ADMIN_ROLES.includes(role);

export const canHaveInstructorProfile = (user) =>
  INSTRUCTOR_ELIGIBLE_ROLES.includes(user?.role);

export const isInstructor = (user) =>
  canHaveInstructorProfile(user) &&
  (user?.accountType === "instructor" ||
    Boolean(user?.instructorId || user?.instructorProfileSlug));

export const APPROVED_STATUSES = ["active", "approved", "accepted"];

const normalizedStatuses = (user) =>
  [
    user?.registrationStatus,
    user?.registration_status,
    user?.profileStatus,
    user?.status,
  ]
    .filter(Boolean)
    .map((status) =>
      String(status).trim().toLowerCase().replaceAll("_", "-"),
    );

export const isActivated = (user) => {
  const registrationStatus = String(
    user?.registrationStatus || user?.registration_status || "",
  )
    .trim()
    .toLowerCase();
  const registrationIsActive =
    APPROVED_STATUSES.includes(registrationStatus) && user?.isActive !== false;

  if (!registrationIsActive) return false;
  if (user?.role !== "teacher") return true;

  const teacherStatus = String(user?.status || user?.profileStatus || "")
    .trim()
    .toLowerCase();
  return APPROVED_STATUSES.includes(teacherStatus);
};

export const isRegistrationIncomplete = (user) => {
  if (isActivated(user)) return false;
  const statuses = normalizedStatuses(user);
  return (
    user?.profileCompleted === false ||
    user?.isProfileComplete === false ||
    statuses.some((status) =>
      ["incomplete", "profile-incomplete", "pending-profile", "verified"].includes(status),
    )
  );
};

export const isAwaitingApproval = (user) =>
  !isActivated(user) &&
  normalizedStatuses(user).some((status) =>
    ["pending", "pending-review", "pending-approval", "under-review"].includes(status),
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

  if (role === "teacher") return { path: "/register/teacher-details", state };
  if (role === "student") return { path: "/register/student-details", state };

  // There is currently no dedicated parent registration-completion endpoint
  // or page. /parent/settings is ordinary profile editing, not onboarding.
  return null;
};

export const getAuthenticatedDestination = (
  user,
  registrationData = {},
  fallback = "/",
) => {
  const continuation = getRegistrationContinuation(user, registrationData);
  if (continuation) return continuation;
  return { path: getDashboardPathByRole(user, fallback) };
};

export const getDashboardPathByRole = (user, fallback = "/") => {
  const continuation = getRegistrationContinuation(user);
  if (continuation) return continuation.path;
  const role = user?.role;
  const isApproved = isActivated(user);
  const isPendingReview = isAwaitingApproval(user);

  if (user?.role === "user" && isInstructor(user)) {
    if (user?.instructorStatus === "suspended") return "/account-state";
    return isPendingReview ? "/pending" : "/instructor-dashboard";
  }

  if (role === "user") {
    return isPendingReview ? "/pending" : "/learner-dashboard";
  }

  if (role === "teacher") {
    return isPendingReview ? "/pending" : "/teacher-dashboard";
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
