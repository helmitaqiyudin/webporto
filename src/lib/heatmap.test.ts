import { expect, it } from "vitest";
import { buildHeatmap } from "./heatmap";

const days = (vals: number[]) =>
  Object.fromEntries(
    vals.map((v, i) => [new Date(Date.UTC(2026, 9, 4 + i)).toISOString().slice(0, 10), { github: v, bitbucket: 0 }]),
  );

it("pads the first week to Sunday and sums totals", () => {
  const h = buildHeatmap(days([1, 2, 3])); // 2026-10-04 is a Sunday
  expect(h.weeks[0][0]?.date).toBe("2026-10-04");
  expect(h.total).toBe(6);
});

it("pads with nulls when the first day is not a Sunday", () => {
  const h = buildHeatmap({ "2026-10-06": { github: 1, bitbucket: 2 } }); // a Tuesday
  expect(h.weeks[0].slice(0, 3)).toEqual([null, null, { date: "2026-10-06", github: 1, bitbucket: 2, total: 3, level: 1 }]);
});

it("all-zero data is level 0 everywhere", () => {
  const h = buildHeatmap(days([0, 0, 0, 0]));
  expect(h.weeks.flat().every((c) => c === null || c.level === 0)).toBe(true);
});

it("assigns quartile levels", () => {
  const h = buildHeatmap(days([0, 1, 2, 3, 4, 8, 20]));
  // non-zero sorted [1,2,3,4,8,20]: nearest-rank q1=2, q2=3, q3=8
  expect(h.weeks.flat().map((c) => c?.level)).toEqual([0, 1, 1, 2, 3, 3, 4]);
});
