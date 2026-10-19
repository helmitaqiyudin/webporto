import { expect, it } from "vitest";
import { decodePolyline, toSvgPath } from "./polyline";

it("decodes the reference polyline", () => {
  expect(decodePolyline("_p~iF~ps|U_ulLnnqC_mqNvxq`@")).toEqual([
    [38.5, -120.2],
    [40.7, -120.95],
    [43.252, -126.453],
  ]);
});

it("builds a path inside the box and handles degenerate input", () => {
  const d = toSvgPath([[0, 0], [1, 1]], 100, 60, 4);
  expect(d.startsWith("M")).toBe(true);
  expect(d).not.toContain("NaN");
  expect(toSvgPath([[0, 0]], 100, 60, 4)).toBe("");
  expect(toSvgPath([], 100, 60, 4)).toBe("");
  expect(toSvgPath([[0, 0], [1, 0]], 100, 60, 4)).not.toContain("NaN");
});

it("keeps every point inside the padded box with north up", () => {
  const d = toSvgPath([[0, 0], [2, 1]], 100, 60, 4);
  const nums = d.replace(/[ML]/g, " ").trim().split(/[\s,]+/).map(Number);
  const xs = nums.filter((_, i) => i % 2 === 0);
  const ys = nums.filter((_, i) => i % 2 === 1);
  expect(Math.min(...xs)).toBeGreaterThanOrEqual(4);
  expect(Math.max(...xs)).toBeLessThanOrEqual(96);
  expect(Math.min(...ys)).toBeGreaterThanOrEqual(4);
  expect(Math.max(...ys)).toBeLessThanOrEqual(56);
  expect(ys[1]).toBeLessThan(ys[0]); // the northern point is drawn higher
});
