export const shortenDisplayName = (value) => {
  const fullName = String(value || '').trim();
  if (!fullName) return 'متعلم';
  return fullName;
};

export const getProtectedContentIdentity = (user = {}) => {
  const identity = user.watermarkIdentity;
  return {
    displayName: shortenDisplayName(identity?.displayName),
    viewerId: String(identity?.viewerId || '').trim().toUpperCase(),
  };
};
