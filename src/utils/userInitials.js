export const getUserInitials = (name) => {
  const words = String(name || "")
    .trim()
    .split(/\s+/u)
    .filter(Boolean);

  if (!words.length) return "؟";

  return words
    .slice(0, 2)
    .map((word) => Array.from(word)[0] || "")
    .join("")
    .toLocaleUpperCase();
};
