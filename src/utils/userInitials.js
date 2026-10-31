export const getUserInitials = (name) => {
  const words = String(name || "")
    .trim()
    .split(/\s+/u)
    .filter(Boolean);

  if (!words.length) return "؟";

  const initials = words
    .slice(0, 2)
    .map((word) => Array.from(word)[0] || "")
    .filter(Boolean);

  const separator =
    initials.length === 2 && initials.every((letter) => /\p{Script=Arabic}/u.test(letter))
      ? " "
      : "";

  return initials.join(separator).toLocaleUpperCase();
};
