const firstValue = (...values) => values.find((value) => String(value || '').trim());

export const shortenDisplayName = (user = {}) => {
  const fullName = String(firstValue(user.fullName, user.name, user.username) || '').trim();
  if (!fullName) return 'متعلم مسجل';
  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 18);
  return `${parts[0].slice(0, 14)} ${parts.at(-1).charAt(0).toUpperCase()}.`;
};

export const maskEmail = (email) => {
  const normalized = String(email || '').trim().toLowerCase();
  const separator = normalized.lastIndexOf('@');
  if (separator < 1) return '';
  const local = normalized.slice(0, separator);
  const domain = normalized.slice(separator + 1);
  if (!domain) return '';
  return `${local.slice(0, Math.min(2, local.length))}***@${domain}`;
};

export const getProtectedContentIdentity = (user = {}) => ({
  displayName: shortenDisplayName(user),
  maskedEmail: maskEmail(user.email),
});
