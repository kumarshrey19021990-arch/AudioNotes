export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatDateTimeShort(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: d.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

