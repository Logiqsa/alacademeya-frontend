export const ADMIN_ROLES = ["admin", "super-admin"];

export const isAdminRole = (role) => ADMIN_ROLES.includes(role);
