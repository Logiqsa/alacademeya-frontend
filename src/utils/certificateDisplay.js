export const shortInstructorName = (name) =>
  String(name || '').trim().split(/\s+/u).filter(Boolean).slice(0, 2).join(' ') || '—';
