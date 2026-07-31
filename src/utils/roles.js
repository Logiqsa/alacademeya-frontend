export const ADMIN_ROLES = ["admin", "super-admin"];

export const isAdminRole = (role) => ADMIN_ROLES.includes(role);

export const APPROVED_STATUSES = ["active", "approved", "accepted"];

export const isActivated = (user) => {
  const status = String(user?.registrationStatus || user?.status || "").toLowerCase();
  return user?.isActive === true || APPROVED_STATUSES.includes(status);
};

export const getDashboardPathByRole = (user, fallback = "/") => {
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
