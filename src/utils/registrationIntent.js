const PUBLIC_ACCOUNT_TYPES = new Set(["learner", "instructor"]);

export const buildRegistrationIntent = (type) =>
  PUBLIC_ACCOUNT_TYPES.has(type)
    ? { accountType: type }
    : { role: type || "student" };

export const isInstructorSignup = (type) => type === "instructor";
