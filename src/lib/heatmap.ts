import type { ActivityDays } from "@/types/api";

export type HeatCell = { date: string; github: number; bitbucket: number; total: number; level: 0 | 1 | 2 | 3 | 4 };

// Nearest-rank quantile over an ascending list.
const quantile = (sorted: number[], p: number) => sorted[Math.max(0, Math.ceil(p * sorted.length) - 1)];

// Columns are Sunday-first weeks; the first column is padded with nulls before the first day.
export function buildHeatmap(days: ActivityDays): { weeks: (HeatCell | null)[][]; total: number } {
  const dates = Object.keys(days).sort();
  const totals = dates.map((d) => days[d].github + days[d].bitbucket);
  const nonZero = totals.filter((t) => t > 0).sort((a, b) => a - b);
  const [q1, q2, q3] = nonZero.length > 0 ? [0.25, 0.5, 0.75].map((p) => quantile(nonZero, p)) : [0, 0, 0];

  const level = (t: number): HeatCell["level"] => (t === 0 ? 0 : t <= q1 ? 1 : t <= q2 ? 2 : t <= q3 ? 3 : 4);

  const cells: (HeatCell | null)[] = [];
  if (dates.length > 0) {
    const firstWeekday = new Date(`${dates[0]}T00:00:00Z`).getUTCDay();
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
  }
  dates.forEach((date, i) => {
    cells.push({ date, github: days[date].github, bitbucket: days[date].bitbucket, total: totals[i], level: level(totals[i]) });
  });

  const weeks: (HeatCell | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return { weeks, total: totals.reduce((a, b) => a + b, 0) };
}
