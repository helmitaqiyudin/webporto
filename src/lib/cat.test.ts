import { expect, it } from "vitest";
import { catFrame, initialCat, stepCat, type CatState } from "./cat";

const at = (x: number, y: number, extra: Partial<CatState> = {}): CatState => ({ ...initialCat(x, y), ...extra });

it("runs toward the cursor at a capped speed and faces the way it moves", () => {
  const s = stepCat(at(0, 0), { x: 1000, y: 0 }, false, 0.1);
  expect(s.mode).toBe("run");
  expect(s.x).toBeCloseTo(18); // 180 px/s × 0.1 s
  expect(s.facing).toBe(1);
  expect(stepCat(at(500, 0), { x: 0, y: 0 }, false, 0.1).facing).toBe(-1);
});

it("stops next to the cursor instead of overshooting or jittering on it", () => {
  let s = at(0, 0);
  for (let i = 0; i < 200; i++) s = stepCat(s, { x: 100, y: 0 }, false, 1 / 60);
  expect(s.mode).toBe("idle");
  expect(100 - s.x).toBeCloseTo(16, 0); // stops at the stop distance
  const still = stepCat(s, { x: 100, y: 0 }, false, 1 / 60);
  expect(still.x).toBe(s.x);
});

it("stays put before the cursor has ever moved", () => {
  const s = stepCat(at(40, 40), null, false, 1);
  expect([s.x, s.y, s.mode]).toEqual([40, 40, "idle"]);
});

it("falls asleep after 10 s idle and wakes up when the cursor moves", () => {
  let s = at(0, 0);
  for (let t = 0; t < 10.05; t += 0.1) s = stepCat(s, null, false, 0.1);
  expect(s.mode).toBe("sleep");
  s = stepCat(s, { x: 0, y: 0 }, true, 0.016);
  expect(s.mode).toBe("wake");
  for (let t = 0; t < 0.7; t += 0.1) s = stepCat(s, { x: 0, y: 0 }, false, 0.1);
  expect(s.mode).toBe("idle");
});

it("does not run while waking up", () => {
  const s = stepCat(at(0, 0, { mode: "wake", modeTime: 0 }), { x: 500, y: 0 }, false, 0.1);
  expect(s.x).toBe(0);
});

it("clamps long frames so a background tab doesn't teleport the cat", () => {
  const s = stepCat(at(0, 0), { x: 5000, y: 0 }, false, 5);
  expect(s.x).toBeLessThanOrEqual(180 * 0.1 + 1e-9);
});

it("picks sprite frames per mode", () => {
  expect(catFrame("idle", 0)).toEqual({ sheet: "idle", frame: 0 });
  expect(catFrame("idle", 0.75)).toEqual({ sheet: "idle", frame: 0 }); // 6 frames at 8 fps loop
  expect(catFrame("run", 1 / 16)).toEqual({ sheet: "run", frame: 1 });
  expect(catFrame("sleep", 10)).toEqual({ sheet: "sleep", frame: 4 }); // plays once, then holds
  expect(catFrame("wake", 0)).toEqual({ sheet: "sleep", frame: 4 }); // sleep frames backwards
  expect(catFrame("wake", 10)).toEqual({ sheet: "sleep", frame: 0 });
});
