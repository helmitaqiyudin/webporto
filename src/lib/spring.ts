export type SpringState = { value: number; velocity: number };
export type SpringConfig = { stiffness: number; damping: number; mass?: number };

const MAX_DT = 0.1;
const SUBSTEP = 1 / 240;

// Damped spring, semi-implicit Euler. Long frames (tab switches) are clamped and substepped
// so a stiff spring can't blow up.
export function stepSpring(s: SpringState, target: number, cfg: SpringConfig, dt: number): SpringState {
  const mass = cfg.mass ?? 1;
  let remaining = Math.min(Math.max(dt, 0), MAX_DT);
  let { value, velocity } = s;
  while (remaining > 0) {
    const h = Math.min(remaining, SUBSTEP);
    const force = -cfg.stiffness * (value - target) - cfg.damping * velocity;
    velocity += (force / mass) * h;
    value += velocity * h;
    remaining -= h;
  }
  return { value, velocity };
}
