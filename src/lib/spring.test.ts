import { expect, it } from "vitest";
import { stepSpring, type SpringConfig } from "./spring";

const run = (from: number, to: number, cfg: SpringConfig, seconds: number) => {
  let s = { value: from, velocity: 0 };
  let max = from;
  for (let t = 0; t < seconds; t += 1 / 60) {
    s = stepSpring(s, to, cfg, 1 / 60);
    max = Math.max(max, s.value);
  }
  return { s, max };
};

it("settles on the target", () => {
  expect(Math.abs(run(1, 2, { stiffness: 300, damping: 10 }, 3).s.value - 2)).toBeLessThan(1e-3);
  expect(Math.abs(run(0, 1, { stiffness: 1000, damping: 20 }, 3).s.value - 1)).toBeLessThan(1e-3);
});

it("keeps the bounce (overshoots with low damping)", () => {
  expect(run(2, 3, { stiffness: 300, damping: 10 }, 2).max).toBeGreaterThan(3.05);
});

it("stays stable on a long frame", () => {
  const s = stepSpring({ value: 0, velocity: 0 }, 1, { stiffness: 1000, damping: 20 }, 0.5);
  expect(Number.isFinite(s.value)).toBe(true);
  expect(Math.abs(s.value)).toBeLessThan(10);
});
