const pad2 = (n: number) => String(n).padStart(2, "0");

export function formatKm(m: number): string {
  const km = m / 1000;
  return km >= 100 ? `${Math.round(km)} km` : `${km.toFixed(1)} km`;
}

export function formatPace(sPerKm: number): string {
  if (!sPerKm || sPerKm <= 0) return "–";
  const s = Math.round(sPerKm);
  return `${Math.floor(s / 60)}:${pad2(s % 60)} /km`;
}

export function formatDuration(s: number): string {
  const total = Math.max(0, Math.round(s));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(sec)}` : `${m}:${pad2(sec)}`;
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Empty for a missing or malformed date: Intl formatters throw on NaN.
export function formatRelativeTime(iso: string, now: Date): string {
  const at = Date.parse(iso);
  if (Number.isNaN(at)) return "";
  const diff = at - now.getTime();
  const abs = Math.abs(diff);
  if (abs < HOUR) return relative.format(Math.round(diff / MINUTE), "minute");
  if (abs < DAY) return relative.format(Math.round(diff / HOUR), "hour");
  if (abs < 30 * DAY) return relative.format(Math.round(diff / DAY), "day");
  if (abs < 365 * DAY) return relative.format(Math.round(diff / (30 * DAY)), "month");
  return relative.format(Math.round(diff / (365 * DAY)), "year");
}

// Heatmap day keys are calendar dates, so format them in UTC to keep the same day everywhere.
const dayFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" });

export function formatDay(date: string): string {
  const at = Date.parse(`${date}T00:00:00Z`);
  return Number.isNaN(at) ? "" : dayFormat.format(at);
}
