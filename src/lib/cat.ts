export type CatMode = "idle" | "run" | "sleep" | "wake";
export type CatState = { x: number; y: number; facing: 1 | -1; mode: CatMode; modeTime: number };
export type Point = { x: number; y: number };

const SPEED = 180; // px per second
const STOP_DISTANCE = 56; // sits this far from the cursor so it never covers the pointer
const START_DISTANCE = 80; // a seated cat only gets up again once the cursor moves this far
const SLEEP_AFTER = 10; // seconds idle
const MAX_DT = 0.1; // a background tab resumes with one huge frame; don't teleport

const FPS = { idle: 8, run: 16, sleep: 8 } as const;
const FRAMES = { idle: 6, run: 12, sleep: 5 } as const;
const WAKE_DURATION = FRAMES.sleep / FPS.sleep;

export function initialCat(x: number, y: number): CatState {
  return { x, y, facing: 1, mode: "idle", modeTime: 0 };
}

const enter = (s: CatState, mode: CatMode): CatState => (s.mode === mode ? s : { ...s, mode, modeTime: 0 });

/** Advances the cat one frame toward `target` (null until the cursor first moves). */
export function stepCat(s: CatState, target: Point | null, cursorMoved: boolean, dt: number): CatState {
  const step = Math.min(Math.max(dt, 0), MAX_DT);
  let next: CatState = { ...s, modeTime: s.modeTime + step };

  if (next.mode === "sleep") return cursorMoved ? enter(next, "wake") : next;
  if (next.mode === "wake") return next.modeTime >= WAKE_DURATION ? enter(next, "idle") : next;

  const dx = target ? target.x - next.x : 0;
  const dy = target ? target.y - next.y : 0;
  const distance = Math.hypot(dx, dy);

  const threshold = next.mode === "run" ? STOP_DISTANCE : START_DISTANCE;
  if (distance > threshold) {
    const move = Math.min(SPEED * step, distance - STOP_DISTANCE);
    next = enter(next, "run");
    next = {
      ...next,
      x: next.x + (dx / distance) * move,
      y: next.y + (dy / distance) * move,
      facing: Math.abs(dx) > 1 ? (dx > 0 ? 1 : -1) : next.facing,
    };
    return next;
  }

  next = enter(next, "idle");
  return next.modeTime >= SLEEP_AFTER ? enter(next, "sleep") : next;
}

/** Which sprite sheet and frame to show; waking plays the sleep frames backwards. */
export function catFrame(mode: CatMode, modeTime: number): { sheet: "idle" | "run" | "sleep"; frame: number } {
  if (mode === "wake") {
    return { sheet: "sleep", frame: Math.max(0, FRAMES.sleep - 1 - Math.floor(modeTime * FPS.sleep)) };
  }
  const tick = Math.floor(modeTime * FPS[mode]);
  const frame = mode === "sleep" ? Math.min(tick, FRAMES.sleep - 1) : tick % FRAMES[mode];
  return { sheet: mode, frame };
}

export const CAT_FRAMES = FRAMES;
