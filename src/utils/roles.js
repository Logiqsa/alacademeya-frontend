export const ADMIN_ROLES = ["admin", "super-admin"];

export const isAdminRole = (role) => ADMIN_ROLES.includes(role);

export const getDashboardPathByRole = (user, fallback = "/") => {
  const role = user?.role;
  const isApproved = user?.registrationStatus === "approved";

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
